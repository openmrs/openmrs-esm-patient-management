import dayjs, { Dayjs } from 'dayjs';

export const isSameMonth = (cellDate: Dayjs, currentDate: Dayjs) => {
  return cellDate.isSame(currentDate, 'month');
};

export const monthDays = (currentDate: Dayjs) => {
  const monthStart = dayjs(currentDate).startOf('month');
  const monthEnd = dayjs(currentDate).endOf('month');
  const monthDays = dayjs(currentDate).daysInMonth();
  const lastMonth = dayjs(currentDate).subtract(1, 'month');
  const nextMonth = dayjs(currentDate).add(1, 'month');

  let days: Dayjs[] = [];
  for (let i = lastMonth.daysInMonth() - monthStart.day(); i < lastMonth.daysInMonth(); i++) {
    days.push(currentDate.date(i).month(lastMonth.month()));
  }

  for (let i = 1; i <= monthDays; i++) {
    days.push(currentDate.date(i));
  }

  const dayLen = days.length > 35 ? 7 : 14;

  for (let i = 1; i < dayLen - monthEnd.day(); i++) {
    days.push(currentDate.date(i).month(nextMonth.month()));
  }
  return days;
};
