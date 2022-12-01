import dayjs, { Dayjs } from 'dayjs';

export const weekDays = (currentDate: Dayjs) => {
  const dateTime: Dayjs[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 8; day++) {
      dateTime.push(
        dayjs(currentDate)
          .day(day === 0 ? 0 : day - 1)
          .hour(hour),
      );
    }
  }
  return dateTime;
};

export const topWeekDays = (currentDate: Dayjs) => {
  const dateTime: Dayjs[] = [];

  for (let hour = 0; hour < 1; hour++) {
    for (let day = 0; day < 8; day++) {
      dateTime.push(
        dayjs(currentDate)
          .day(day === 0 ? 0 : day - 1)
          .hour(hour),
      );
    }
  }
  return dateTime;
};
