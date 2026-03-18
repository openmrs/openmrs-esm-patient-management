import { createGlobalStore, useStoreWithActions } from '@openmrs/esm-framework';
import { type AppointmentStatus } from './types';

interface AppointmentsStore {
  appointmentServiceTypes: Array<string>;
  selectedAppointmentStatuses: Set<AppointmentStatus>;
}

export const appointmentsStore = createGlobalStore<AppointmentsStore>(
  'appointments-app',
  {
    appointmentServiceTypes: [],
    selectedAppointmentStatuses: new Set(),
  },
  'sessionStorage',
);

export function useAppointmentsStore() {
  return useStoreWithActions(appointmentsStore, {
    setAppointmentServiceTypes(_, appointmentServiceTypes: Array<string>) {
      return { appointmentServiceTypes };
    },
    setSelectedAppointmentStatuses(_, selectedAppointmentStatuses: Set<AppointmentStatus>) {
      return { selectedAppointmentStatuses };
    },
  });
}
