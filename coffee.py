from ucollections import deque
import utime

class RoastData(object):

    WINDOW_SIZE = 10

    def __init__(self):
        self.start_time = None
        self.latest_time = None
        self.bean_temp = None
        self.latest_note = None
        self._row_data = deque([], self.WINDOW_SIZE)
        self._moving_averaged_data = deque([], self.WINDOW_SIZE)

    def update_temperature(self, temperature, note=None):
        """
        Records the current temperature, updates the bean temperature using a moving average,
        and stores the latest time and status.

        :param temperature: Current temperature reading
        :param note: Optional status or note associated with this reading
        :return: Calculated bean temperature based on the moving average
        """
        self._row_data.append(temperature)
        self.bean_temp = sum(self._row_data) / len(self._row_data)
        self.latest_time = utime.time()
        self.latest_note = note
        self._moving_averaged_data.append((self.latest_time, self.bean_temp))
        return self.bean_temp

    def calculate_rate_of_rise(self):
        """
        Calculates the Rate of Rise (RoR) based on the last two temperature readings.

        :return: Rate of Rise in °C/min or 0 if not enough data is available
        """
        if len(self._moving_averaged_data) < 2:
            return 0
        (time1, temp1), (time2, temp2) = list(self._moving_averaged_data)[-2:]
        time_diff = time2 - time1
        if time_diff == 0:
            return 0
        temp_diff = temp2 - temp1
        return (temp_diff / time_diff) * 60
