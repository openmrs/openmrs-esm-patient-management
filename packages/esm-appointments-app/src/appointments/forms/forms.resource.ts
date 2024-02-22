import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentPayload } from '../../types';
import dayjs from 'dayjs';
import { omrsDateFormat } from '../../constants';

// TODO we should refactor all this stuff to use the cancel functionality from patient-chart (or vice versa, but should move into the forms directory regardless)

export const cancelAppointment = async (toStatus: string, appointmentUuid: string) => {
  const abortController = new AbortController();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const statusChangeTime = dayjs(new Date()).format(omrsDateFormat);
  const url = `${restBaseUrl}/appointments/${appointmentUuid}/status-change`;
  return await openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
  });
};

// NOTE: I don't think this is used anywhere?
export const checkAppointmentConflict = async (appointmentPayload: AppointmentPayload) => {
  return await openmrsFetch(`${restBaseUrl}/appointments/conflicts`, {
    method: 'POST',
    body: {
      patientUuid: appointmentPayload.patientUuid,
      serviceUuid: appointmentPayload.serviceUuid,
      startDateTime: appointmentPayload.startDateTime,
      endDateTime: appointmentPayload.endDateTime,
      providers: [],
      locationUuid: appointmentPayload.locationUuid,
      appointmentKind: appointmentPayload.appointmentKind,
    },
    headers: { 'Content-Type': 'application/json' },
  });
};

export const toAppointmentDateTime = (fromDate: Date, hours: number, minutes: number) => {
  return dayjs(new Date(dayjs(fromDate).year(), dayjs(fromDate).month(), dayjs(fromDate).date(), hours, minutes));
};
