import { type Actions, createGlobalStore, useStoreWithActions } from '@openmrs/esm-framework';
import { type AppointmentStatus } from './types';
import dayjs from 'dayjs';

interface AppointmentsStore {
  appointmentServiceTypes: Array<string>;
  selectedAppointmentStatuses: Array<AppointmentStatus>;

  selectedDate: string;

  calendarView: 'monthly' | 'weekly' | 'daily';
}

/* Initialize global store with default filters and current date */
export const appointmentsStore = createGlobalStore<AppointmentsStore>('appointments-app', {
  appointmentServiceTypes: [],
  selectedAppointmentStatuses: [],

  selectedDate: dayjs().format('YYYY-MM-DD'),

  calendarView: 'monthly',
});

/* Define store actions for controlled state updates */
export const storeActions = {
  /* Update selected service type filters */
  setAppointmentServiceTypes(_, appointmentServiceTypes: Array<string>) {
    return { appointmentServiceTypes };
  },

  /* Update selected appointment status filters */
  setSelectedAppointmentStatuses(_, selectedAppointmentStatuses: Array<AppointmentStatus>) {
    return { selectedAppointmentStatuses };
  },
} satisfies Actions<AppointmentsStore>;

/* Hook to access store state along with actions */
export function useAppointmentsStore() {
  return useStoreWithActions(appointmentsStore, storeActions);
}

/* Update current calendar view (UI-only state) */
export function setCalendarView(view: 'daily' | 'weekly' | 'monthly') {
  appointmentsStore.setState({ calendarView: view });
}

/* Update service type filters directly */
export function setAppointmentServiceTypes(serviceTypes: Array<string>) {
  appointmentsStore.setState({ appointmentServiceTypes: serviceTypes });
}

/* Deprecated: selectedDate is now managed via URL */
export function setSelectedDate() {
  console.warn('selectedDate is deprecated. Use URL (useSelectedDate) instead.');
}

/* Cache last known service types to prevent redundant writes */
let lastValueOfAppointmentServiceTypes = getFromLocalStorage('openmrs:appointments:serviceTypes');

/* Retrieve persisted value from localStorage */
function getFromLocalStorage(key: string) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : undefined;
}

/* Persist value to localStorage */
function setInLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* Sync service type filters with localStorage on state changes */
appointmentsStore.subscribe(({ appointmentServiceTypes }) => {
  if (lastValueOfAppointmentServiceTypes !== appointmentServiceTypes) {
    setInLocalStorage('openmrs:appointments:serviceTypes', appointmentServiceTypes);
    lastValueOfAppointmentServiceTypes = appointmentServiceTypes;
  }
});
