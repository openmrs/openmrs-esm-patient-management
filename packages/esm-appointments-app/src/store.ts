import { type Actions, createGlobalStore, useStoreWithActions } from '@openmrs/esm-framework';
import { type AppointmentStatus } from './types';

export type CalendarView = 'monthly' | 'weekly' | 'daily';

interface AppointmentsStore {
  appointmentServiceTypes: Array<string>;
  selectedAppointmentStatuses: Array<AppointmentStatus>;
  calendarView: CalendarView;
}

export const appointmentsStore = createGlobalStore<AppointmentsStore>(
  'appointments-app',
  {
    appointmentServiceTypes: [],
    selectedAppointmentStatuses: [],
    calendarView: 'monthly',
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
  setCalendarView(_, calendarView: CalendarView) {
    return { calendarView };
  },
} satisfies Actions<AppointmentsStore>;

export function useAppointmentsStore() {
  return useStoreWithActions(appointmentsStore, storeActions);
}
