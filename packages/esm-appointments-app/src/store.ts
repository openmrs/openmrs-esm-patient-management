import { type Actions, createGlobalStore, useStoreWithActions } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { omrsDateFormat } from './constants';
import { type AppointmentStatus } from './types';

export type CalendarView = 'monthly' | 'weekly' | 'daily';

interface AppointmentsStore {
  appointmentServiceTypes: Array<string>;
  selectedAppointmentStatuses: Array<AppointmentStatus>;
  calendarView: CalendarView;
  selectedDate: string;
}

export const appointmentsStore = createGlobalStore<AppointmentsStore>('appointments-app', {
  appointmentServiceTypes: [],
  selectedAppointmentStatuses: [],
  calendarView: 'monthly',
  selectedDate: dayjs().startOf('day').format(omrsDateFormat),
});

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
  setSelectedDate(_, selectedDate: string) {
    return { selectedDate };
  },
} satisfies Actions<AppointmentsStore>;

export function useAppointmentsStore() {
  return useStoreWithActions(appointmentsStore, storeActions);
}

export function setSelectedDate(date: string) {
  appointmentsStore.setState({ selectedDate: date });
}
