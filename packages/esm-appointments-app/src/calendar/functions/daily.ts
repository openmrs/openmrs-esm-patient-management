import dayjs, { Dayjs } from 'dayjs';

export const dailyHours = (currentDate: Dayjs) => {
  const dateTime: Dayjs[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 1; day++) {
      dateTime.push(
        dayjs(currentDate)
          .day(day === 0 ? 0 : day - 1)
          .hour(hour),
      );
    }
  }
  return dateTime;
};
