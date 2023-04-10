import { OpenmrsResource, useSession } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { amPm } from '../../helpers';
import { MappedAppointment } from '../../types';

export interface PatientAppointment {
  appointmentKind: string;
  status: string;
  serviceUuid: string;
  startDateTime: string;
  endDateTime: string;
  providerUuid: string;
  providers: Array<OpenmrsResource>;
  comments: string;
  locationUuid: string;
  patientUuid: string;
  appointmentNumber: string;
  uuid?: string;
  frequency: string;
  visitDate: Date;
  timeFormat: amPm;
  isFullDay: boolean;
  day: any;
}

/**
 * A hook that returns the initial form value for a patient appointment.
 * @param appointment The appointment object to use as a basis for the initial form value.
 * @param patientUuid The UUID of the patient associated with the appointment.
 * @returns The initial form value for the appointment.
 */
export const useInitialAppointmentFormValue = (
  appointment: MappedAppointment,
  patientUuid: string,
): PatientAppointment => {
  const session = useSession();

  // Build the initial form value for the appointment.
  const patientAppointment: PatientAppointment = {
    appointmentKind: appointment?.appointmentKind ?? 'Scheduled',
    status: appointment?.status ?? 'Scheduled',
    serviceUuid: appointment?.serviceUuid ?? '',
    startDateTime: dayjs(new Date()).format('hh:mm'),
    endDateTime: dayjs(new Date()).format('hh:mm'),
    providers: appointment?.providers ?? [],
    providerUuid: appointment?.providers?.[0]?.uuid ?? session?.currentProvider?.uuid,
    comments: appointment?.comments ?? '',
    locationUuid: appointment?.location ?? session?.sessionLocation?.uuid,
    frequency: '',
    uuid: appointment?.id ?? '',
    appointmentNumber: appointment?.appointmentNumber ?? '',
    patientUuid: appointment?.patientUuid ?? patientUuid,
    visitDate: appointment?.dateTime ? new Date(appointment.dateTime) : new Date(),
    timeFormat: new Date().getHours() >= 12 ? 'PM' : 'AM',
    isFullDay: true,
    day: appointment?.dateTime,
  };

  return patientAppointment;
};
