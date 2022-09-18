import { openmrsFetch } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { omrsDateFormat } from '../constants';

export const changeAppointmentStatus = (toStatus: string, appointmentUuid: string, ac: AbortController) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const statusChangeTime = dayjs(new Date()).format(omrsDateFormat);
  const url = `/ws/rest/v1/appointments/${appointmentUuid}/status-change`;
  return openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
};
