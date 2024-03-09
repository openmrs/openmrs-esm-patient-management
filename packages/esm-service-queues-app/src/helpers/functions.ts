import { type OpenmrsResource } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

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
