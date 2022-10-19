import { openmrsFetch } from '@openmrs/esm-framework';
import { amPm } from '../../helpers';
import { AppointmentService } from '../../types';

const appointmentServiceInitialValue: AppointmentService = {
  appointmentServiceId: 0,
  creatorName: '',
  description: '',
  durationMins: '',
  endTime: '',
  initialAppointmentStatus: '',
  location: { uuid: '', display: '' },
  maxAppointmentsLimit: 0,
  name: '',
  startTime: '',
  uuid: '',
  color: '',
  startTimeTimeFormat: new Date().getHours() >= 12 ? 'PM' : 'AM',
  endTimeTimeFormat: new Date().getHours() >= 12 ? 'PM' : 'AM',
};

const addNewAppointmentService = (payload) => {
  return openmrsFetch('/ws/rest/v1/appointmentService', {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const useAppointmentServices = () => {
  return { appointmentServiceInitialValue, addNewAppointmentService };
};
