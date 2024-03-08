import { type OpenmrsResource } from '@openmrs/esm-framework';
import { type StatusStyle } from '../types';
import dayjs from 'dayjs';

export const getStatusStyle = (status: string, config: StatusStyle[]): StatusStyle => {
  return config.find((c) => c.statusUuid === status);
};

export const buildStatusString = (status: string, service: string) => {
  if (!status || !service) {
    return '';
  }

  return `${status} - ${service}`;
};

export const formatWaitTime = (startedAt: Date, t) => {
  const waitTimeMinutes = dayjs().diff(startedAt, 'minutes');
  const hours = waitTimeMinutes / 60;
  const fullHours = Math.floor(hours);
  const minutes = (hours - fullHours) * 60;
  const fullMinutes = Math.round(minutes);
  if (fullHours > 0) {
    return fullHours + ' ' + `${t('hoursAnd', 'hours and ')}` + fullMinutes + ' ' + `${t('minutes', 'minutes')}`;
  } else {
    return fullMinutes + ' ' + `${t('minutes', 'minutes')}`;
  }
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

export function findObsByConceptUUID(arr: Array<OpenmrsResource>, ids: Array<string>) {
  for (const visit of arr) {
    return visit.obs.filter((o) => {
      return ids.includes(o.concept.uuid);
    });
  }
}

export function timeDiffInMinutes(date1: Date, date2: Date) {
  return Math.round((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
}
