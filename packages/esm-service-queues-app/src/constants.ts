import dayjs from 'dayjs';
export const spaRoot = window['getOpenmrsSpaBase'];
export const spaBasePath = `${window.spaBase}/home`;
export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
export const startOfDay = dayjs(new Date().setUTCHours(0, 0, 0, 0)).format(omrsDateFormat);
export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const datePickerPlaceHolder = 'dd/mm/yyyy';
export const datePickerFormat = 'd/m/Y';
export const time12HourFormatRegexPattern = '^(1[0-2]|0?[1-9]):[0-5][0-9]$';
