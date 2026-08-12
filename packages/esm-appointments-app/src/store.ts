import { type Actions, createGlobalStore, useStoreWithActions } from '@openmrs/esm-framework';
import { type AppointmentStatus } from './types';

interface AppointmentsStore {
  appointmentServiceTypes: Array<string>;
  selectedAppointmentStatuses: Array<AppointmentStatus>;
}

export const appointmentsStore = createGlobalStore<AppointmentsStore>(
  'appointments-app',
  {
    appointmentServiceTypes: [],
    selectedAppointmentStatuses: [],
  },
  'sessionStorage',
);

export const storeActions = {
  setAppointmentServiceTypes(_, appointmentServiceTypes: Array<string>) {
    return { appointmentServiceTypes };
  },
  setSelectedAppointmentStatuses(_, selectedAppointmentStatuses: Array<AppointmentStatus>) {
    return { selectedAppointmentStatuses };
  },
} satisfies Actions<AppointmentsStore>;

export function useAppointmentsStore() {
  return useStoreWithActions(appointmentsStore, storeActions);
}
