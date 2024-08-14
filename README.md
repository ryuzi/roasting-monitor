# Raspberry Pi Pico W Coffee Roasting Monitor

This project is a coffee roasting monitor built using the Raspberry Pi Pico W. It measures the temperature of coffee beans during roasting, displays the data on an OLED screen, and sends the data to a Google Spreadsheet for logging and analysis. The system is designed to be easy to use and adaptable for anyone interested in monitoring and improving their coffee roasting process.

## Features

- **Temperature Monitoring**: Uses a MAX6675 thermocouple sensor to measure the temperature of the beans.
- **Real-Time Display**: An OLED screen shows the current temperature, rate of rise (RoR), elapsed time, and any user notes.
- **Data Logging**: Sends temperature data to a Google Spreadsheet for record-keeping and analysis.
- **Wi-Fi Connectivity**: Automatically connects to Wi-Fi and syncs the time with an NTP server.

## Requirements

- **Hardware**:
  - Raspberry Pi Pico W
  - MAX6675 thermocouple sensor
  - SSD1306 OLED display
  - Push buttons or switches for roasting stages
  - Wi-Fi network

- **Software**:
  - MicroPython installed on Raspberry Pi Pico W
  - Required Python libraries:
    - `max6675.py` (for the MAX6675 sensor)
    - `ssd1306.py` (for the OLED display)
    - `secrets.py` (for storing Wi-Fi credentials and Google Apps Script URL)

## Setup Instructions

### 1. Hardware Setup

1. **Connect the OLED Display**:
   - Connect the `SDA` pin to GPIO 14.
   - Connect the `SCL` pin to GPIO 15.

2. **Connect the MAX6675 Sensor**:
   - Connect the `SCK` pin to GPIO 27.
   - Connect the `CS` pin to GPIO 26.
   - Connect the `SO` pin to GPIO 22.

3. **Connect the Switches**:
   - Connect each switch to the corresponding GPIO pin as defined in the `SWITCH_PINS` dictionary in the code.

### 2. Software Setup

1. **Install MicroPython**:
   - Follow the [official guide](https://www.raspberrypi.org/documentation/microcontrollers/micropython.html) to install MicroPython on your Raspberry Pi Pico W.

2. **Upload the Python Files**:
   - Copy the following files to your Pico W:
     - `main.py`: The main script that runs the program.
     - `max6675.py`: The driver for the MAX6675 sensor.
     - `ssd1306.py`: The driver for the OLED display.
     - `secrets.py`: A file where you store your Wi-Fi SSID, password, and Google Apps Script URL.

3. **Edit `secrets.py`**:
   - Add your Wi-Fi SSID and password.
   - Add your Google Apps Script deployment ID (used for logging data to the Google Spreadsheet).

   Example:
   ```python
   WIFI_SSID = "YourSSID"
   WIFI_PASSWORD = "YourPassword"
   DEPLOY_ID = "YourGoogleAppsScriptID"
   ```

4. **Run the Program**:
   - After uploading the files, the program will automatically start when the Pico W is powered on.

## How It Works

1. **Connecting to Wi-Fi**:
   - The Pico W will connect to your Wi-Fi network using the credentials provided in `secrets.py`.

2. **Syncing Time**:
   - The current time will be synced with an NTP server and adjusted to Japan Standard Time (JST).

3. **Monitoring and Display**:
   - The temperature data from the MAX6675 sensor is continuously read and displayed on the OLED screen.

4. **Data Logging**:
   - The data is buffered and sent to a Google Spreadsheet in batches. The status of the data sending is indicated by an LED.

## Troubleshooting

- **Wi-Fi Connection Issues**:
  - Ensure that the SSID and password in `secrets.py` are correct.
  - Make sure your Wi-Fi network is within range.

- **Sensor Readings Not Displaying**:
  - Check the connections of the MAX6675 sensor and OLED display.
  - Verify that the pins used in the code match the pins connected to your hardware.

- **Data Not Logging to Spreadsheet**:
  - Make sure your Google Apps Script URL is correct in `secrets.py`.
  - Check the internet connection and ensure that the Pico W is online.

## Customization

- **Adding More Switches**:
  - You can easily add more switches to monitor additional stages of roasting. Just update the `SWITCH_PINS` dictionary and add corresponding actions in the code.

- **Changing Display Information**:
  - You can customize what is shown on the OLED display by modifying the `refresh_display` function.

- **Adjusting Data Buffer Size**:
  - If you want to send data in smaller or larger chunks, adjust the `BUFFER_LIMIT` constant in the code.

## Conclusion

This project provides a solid foundation for monitoring and improving your coffee roasting process. Whether you're a beginner or an experienced hobbyist, this setup is designed to be straightforward and easy to use. Happy roasting!

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are welcome.

## License

This project is licensed under the MIT License.
