import dayjs from 'dayjs';

export type amPm = 'AM' | 'PM';

export const convertTime12to24 = (time12h, timeFormat: amPm) => {
  let [hours, minutes] = time12h.split(':');

  if (hours === '12' && timeFormat === 'AM') {
    hours = '00';
  }

  if (timeFormat === 'PM') {
    hours = hours === '12' ? hours : parseInt(hours, 10) + 12;
  }

  return [hours, minutes];
};

export const startDate = dayjs(new Date().setHours(0, 0, 0, 0)).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
