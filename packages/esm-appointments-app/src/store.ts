import { type Actions, createGlobalStore, useStoreWithActions } from '@openmrs/esm-framework';
import { type AppointmentStatus } from './types';

interface AppointmentsStore {
  appointmentServiceTypes: Array<string>;
  selectedAppointmentStatuses: Array<AppointmentStatus>;
  calendarProviderUuids: Array<string>;
  calendarServiceUuids: Array<string>;
}

export const appointmentsStore = createGlobalStore<AppointmentsStore>(
  'appointments-app',
  {
    appointmentServiceTypes: [],
    selectedAppointmentStatuses: [],
    calendarProviderUuids: [],
    calendarServiceUuids: [],
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
  setCalendarProviderUuids(_, calendarProviderUuids: Array<string>) {
    return { calendarProviderUuids };
  },
  setCalendarServiceUuids(_, calendarServiceUuids: Array<string>) {
    return { calendarServiceUuids };
  },
} satisfies Actions<AppointmentsStore>;

export function useAppointmentsStore() {
  return useStoreWithActions(appointmentsStore, storeActions);
}
