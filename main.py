import _thread
import gc
import network
import ntptime
import ujson
import urequests
import utime
from machine import Pin, I2C
from max6675 import MAX6675
from ssd1306 import SSD1306_I2C
from secrets import DEPLOY_ID, WIFI_SSID, WIFI_PASSWORD
from coffee import RoastData

# Constants
JST_OFFSET = 9 * 3600  # Offset for Japan Standard Time (JST) from UTC
SDA_PIN = 14           # SDA pin for I2C communication
SCL_PIN = 15           # SCL pin for I2C communication
SCK_PIN = 27           # SCK pin for MAX6675 thermocouple sensor
CS_PIN = 26            # CS pin for MAX6675 thermocouple sensor
SO_PIN = 22            # SO pin for MAX6675 thermocouple sensor
BUFFER_LIMIT = 10      # Buffer limit for sending data in chunks
SPREADSHEET_URL = f"https://script.google.com/macros/s/{DEPLOY_ID}/exec"  # Google Apps Script URL
SWITCH_PINS = {"Charge": 2, "Clack1": 3, "Clack2": 4, "Drop": 5}  # Switches for different roasting stages

# Global Variables
note = None  # Holds the latest switch note
thread_running = True  # Flag to control the running state of the monitor_temperature thread
thread_finished = False  # Flag to indicate if the monitor_temperature thread has finished

def init_lcd(sda_pin, scl_pin):
    """Initializes the I2C and SSD1306 OLED display."""
    i2c = I2C(1, sda=Pin(sda_pin), scl=Pin(scl_pin))
    return SSD1306_I2C(128, 64, i2c)

def init_sensor(sck_pin, cs_pin, so_pin):
    """Initializes the MAX6675 thermocouple sensor."""
    return MAX6675(sck=Pin(sck_pin, Pin.OUT), cs=Pin(cs_pin, Pin.OUT), so=Pin(so_pin, Pin.IN))

def switch_handler(pin, switch_name):
    """Interrupt handler for switch inputs; updates the global note variable."""
    global note
    note = switch_name

def init_switches(switch_pins):
    """Initializes the switches and assigns interrupt handlers to them."""
    for name, pin_num in switch_pins.items():
        pin = Pin(pin_num, Pin.IN, Pin.PULL_DOWN)
        pin.irq(trigger=Pin.IRQ_FALLING, handler=lambda p, n=name: switch_handler(p, n))

def init_indicator_pin(pin_name="LED"):
    """Initializes an indicator pin, typically used to signal data sending activity."""
    return Pin(pin_name, Pin.OUT)

def format_elapsed_time(start_time, latest_time):
    """Formats the elapsed time as MM:SS from start_time to latest_time."""
    if not start_time or not latest_time:
        return "00:00"
    elapsed_seconds = int(latest_time - start_time)
    minutes, seconds = divmod(elapsed_seconds, 60)
    return f"{minutes:02d}:{seconds:02d}"

def connect_to_wifi(lcd, ssid, password, max_attempts=10):
    """Connects the device to a Wi-Fi network, displaying status on the LCD."""
    lcd.fill(0)
    lcd.text("Connecting to Wi-Fi", 10, 10)
    lcd.show()

    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)

    for attempt in range(max_attempts):
        if wlan.isconnected():
            lcd.text("> Connected", 10, 40)
            lcd.show()
            print(f"Connected to Wi-Fi\nIP Address: {wlan.ifconfig()[0]}")
            return
        lcd.text("." * (attempt + 1), 10, 30)
        lcd.show()
        utime.sleep(1)

    lcd.text("> Failed", 10, 40)
    lcd.show()
    raise Exception("Failed to connect to Wi-Fi.")

def sync_time():
    """Synchronizes the system time with an NTP server, adjusting for JST."""
    try:
        ntptime.host = "ntp.nict.jp"
        ntptime.settime()
        current_time = utime.time() + JST_OFFSET
        local_time = utime.localtime(current_time)
        print(f"Current time (JST): {local_time[0]:04}-{local_time[1]:02}-{local_time[2]:02} ",
              f"{local_time[3]:02}:{local_time[4]:02}:{local_time[5]:02}")
    except Exception as e:
        print(f"Error syncing time: {e}")
        raise

def refresh_display(lcd, roast_data, waiting_to_send):
    """Updates the OLED display with the latest roasting data."""
    elapsed_time_str = format_elapsed_time(roast_data.start_time, roast_data.latest_time)
    lcd.fill(0)
    lcd.text(f"Time {elapsed_time_str}", 10, 10)
    lcd.text(f"Bean {roast_data.bean_temp:.2f}", 10, 20)
    lcd.text(f"RoR  {roast_data.calculate_rate_of_rise():.2f}", 10, 30)
    lcd.text(f"Note {roast_data.latest_note or ''}", 10, 40)
    lcd.text(f"Wait {waiting_to_send}", 10, 50)
    lcd.show()

def send_data(shared_data, sending_indicator):
    """Sends buffered roasting data to Google Apps Script in chunks."""
    while True:
        if len(shared_data) < BUFFER_LIMIT:
            utime.sleep(0.5)
            continue

        try:
            sending_indicator.value(1)  # Turn on indicator before sending
            send_queue = shared_data[:BUFFER_LIMIT]
            response = urequests.post(SPREADSHEET_URL,
                                      data=ujson.dumps({"data": send_queue}),
                                      headers={'Content-Type': 'application/json'})
            response.close()
            del shared_data[:BUFFER_LIMIT]  # Remove sent data from buffer
            if not shared_data:
                break  # Exit if all data has been sent
        except Exception as e:
            print(f"Failed to send data: {e}")
        finally:
            sending_indicator.value(0)  # Turn off indicator after sending
            gc.collect()  # Run garbage collection

def monitor_temperature(shared_data, lcd, sensor):
    """Monitors the temperature, updates the roasting data, and displays it on the LCD."""
    global thread_finished, note
    roast_data = RoastData()
    roast_data.start_time = utime.time()

    while thread_running:
        bean_temp = roast_data.update_temperature(sensor.read(), note)
        rate_of_rise = roast_data.calculate_rate_of_rise()
        timestamp = utime.time()
        shared_data.append({'temp': bean_temp, 'time': timestamp, 'ror': rate_of_rise, 'note': note or ''})
        note = None  # Clear the note after processing
        refresh_display(lcd, roast_data, len(shared_data))
        utime.sleep(1)

    thread_finished = True  # Indicate the thread has finished

def main():
    """Main function to initialize components, start threads, and manage the roasting process."""
    global thread_running, thread_finished

    # Initialize hardware components
    lcd = init_lcd(SDA_PIN, SCL_PIN)
    sensor = init_sensor(SCK_PIN, CS_PIN, SO_PIN)
    init_switches(SWITCH_PINS)
    sending_indicator = init_indicator_pin()

    # Connect to Wi-Fi and sync time
    connect_to_wifi(lcd, WIFI_SSID, WIFI_PASSWORD)
    sync_time()

    shared_data = []  # Shared buffer between threads for roasting data

    try:
        # Start temperature monitoring thread
        _thread.start_new_thread(monitor_temperature, (shared_data, lcd, sensor))
        # Start data sending process in the main thread
        send_data(shared_data, sending_indicator)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Ensure the temperature monitoring thread stops gracefully
        print("Stopping monitor_temperature...")
        thread_running = False
        while not thread_finished:
            utime.sleep(1)
        print("monitor_temperature finished")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Unhandled exception: {e}")
