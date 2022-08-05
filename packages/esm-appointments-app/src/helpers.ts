import { formatDate, formatDatetime, parseDate } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { Appointment } from './types';

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

export type amPm = 'AM' | 'PM';

export const getAppointment = (appointment: Appointment) => {
  let formattedAppointment = {
    id: appointment.uuid,
    name: appointment.patient.name,
    age: appointment.patient?.birthDate,
    gender: appointment.patient?.gender,
    phoneNumber: appointment.patient?.contact,
    dob: formatDate(parseDate(appointment.patient?.birthDate), { mode: 'wide' }),
    patientUuid: appointment.patient.uuid,
    dateTime: formatDatetime(parseDate(appointment.startDateTime)),
    serviceType: appointment.service ? appointment.service.name : '--',
    serviceUuid: appointment.service ? appointment.service.uuid : null,
    appointmentKind: appointment.appointmentKind ? appointment.appointmentKind : '--',
    status: appointment.status,
    provider: appointment.provider ? appointment.provider.person.display : '--',
    location: appointment.location ? appointment.location.name : '--',
    comments: appointment.comments ? appointment.comments : '--',
    appointmentNumber: appointment.appointmentNumber,
  };
  return formattedAppointment;
};
