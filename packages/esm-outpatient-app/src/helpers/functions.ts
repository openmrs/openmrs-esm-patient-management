import { OpenmrsResource } from '@openmrs/esm-framework';
import { MappedQueuePriority } from '../active-visits/active-visits-table.resource';

export const getTagType = (priority: string) => {
  switch (priority as MappedQueuePriority) {
    case 'Emergency':
      return 'red';
    case 'Not Urgent':
      return 'green';
    default:
      return 'gray';
  }
};

export const buildStatusString = (status: string, service: string) => {
  if (!status || !service) {
    return '';
  }

  if (status === 'waiting') {
    return `${status} for ${service}`;
  } else if (status === 'in service') {
    return `Attending ${service}`;
  } else if (status === 'finished service') {
    return `Finished ${service}`;
  }
};

export const formatWaitTime = (waitTime: string, t) => {
  const num = parseInt(waitTime);
  const hours = num / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  if (rhours > 0) {
    return rhours + ' ' + `${t('hoursAnd', 'hours and ')}` + rminutes + ' ' + `${t('minutes', 'minutes')}`;
  } else {
    return rminutes + ' ' + `${t('minutes', 'minutes')}`;
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

export function generateVisitQueueNumber(service, maxVisitNumber) {
  const servicePrefix = service?.toUpperCase().substring(0, 3);
  const visitNumber = (maxVisitNumber + 1)?.toString().padStart(4, '0');
  return servicePrefix + '-' + visitNumber;
}

export function findObsByConceptUUID(arr: Array<OpenmrsResource>, ids: Array<string>) {
  for (const visit of arr) {
    return visit.obs.filter((o) => {
      return ids.includes(o.concept.uuid);
    });
  }
}
