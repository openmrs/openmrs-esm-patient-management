import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AppointmentService } from '../../types';

const appointmentServiceInitialValue: AppointmentService = {
  appointmentServiceId: 0,
  creatorName: '',
  description: '',
  durationMins: 0,
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
  return openmrsFetch(`${restBaseUrl}/appointmentService`, {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const useAppointmentServices = () => {
  return { appointmentServiceInitialValue, addNewAppointmentService };
};
