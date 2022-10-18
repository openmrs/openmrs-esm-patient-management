import dayjs from 'dayjs';
export const spaRoot = window['getOpenmrsSpaBase'];
export const basePath = '/outpatient';
export const spaBasePath = `${window.spaBase}${basePath}`;
export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
export const startOfDay = dayjs(new Date().setUTCHours(0, 0, 0, 0)).format(omrsDateFormat);
export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
