import { CalendarDate, startOfMonth, endOfMonth, getDayOfWeek, isSameMonth } from '@internationalized/date';
import { getLocale } from '@openmrs/esm-utils';
import { type AppointmentSummary, type Appointment } from '../types';

export const getHighestAppointmentServiceLoad = (appointmentSummary: Array<any> = []) => {
  const groupedAppointments = appointmentSummary?.map(({ countMap, serviceName }) => ({
    serviceName: serviceName,
    count: countMap.reduce((cummulator, currentValue) => cummulator + currentValue.allAppointmentsCount, 0),
  }));
  return groupedAppointments.find((summary) => summary.count === Math.max(...groupedAppointments.map((x) => x.count)));
};

export const flattenAppointmentSummary = (appointmentToTransfrom: Array<any>) =>
  appointmentToTransfrom.flatMap((el: any) => ({
    serviceName: el.appointmentService.name,
    countMap: Object.entries(el.appointmentCountMap).flatMap((el) => el[1]),
  }));

export const getServiceCountByAppointmentType = (
  appointmentSummary: Array<AppointmentSummary>,
  appointmentType: string,
) => {
  return appointmentSummary
    .map((el) => Object.entries(el.appointmentCountMap).flatMap((el) => el[1][appointmentType]))
    .flat(1)
    .reduce((count, val) => count + val, 0);
};

export const formatAMPM = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
};

export const isSameCalendarMonth = (cellDate: CalendarDate, currentDate: CalendarDate) => {
  return isSameMonth(cellDate, currentDate);
};

export const monthDays = (currentDate: CalendarDate) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = currentDate.calendar.getDaysInMonth(currentDate);
  const lastMonth = currentDate.subtract({ months: 1 });
  const nextMonth = currentDate.add({ months: 1 });
  let days: CalendarDate[] = [];

  const lastMonthDays = lastMonth.calendar.getDaysInMonth(lastMonth);
  for (let i = lastMonthDays - getDayOfWeek(monthStart, getLocale()) + 1; i <= lastMonthDays; i++) {
    days.push(new CalendarDate(lastMonth.year, lastMonth.month, i));
  }

  for (let i = 1; i <= monthDays; i++) {
    days.push(new CalendarDate(currentDate.year, currentDate.month, i));
  }

  const dayLen = days.length > 30 ? 7 : 14;

  for (let i = 1; i < dayLen - getDayOfWeek(monthEnd, getLocale()); i++) {
    days.push(new CalendarDate(nextMonth.year, nextMonth.month, i));
  }
  return days;
};

export const getGender = (gender, t) => {
  switch (gender) {
    case 'M':
      return t('male', 'Male');
    case 'F':
      return t('female', 'Female');
    case 'O':
      return t('other', 'Other');
    case 'U':
      return t('unknown', 'Unknown');
    default:
      return gender;
  }
};
