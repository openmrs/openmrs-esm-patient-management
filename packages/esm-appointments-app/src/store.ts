import { type Actions, createGlobalStore, useStoreWithActions } from '@openmrs/esm-framework';
import { type AppointmentStatus } from './types';
import { createGlobalStore, isOmrsDateStrict, useStore } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { omrsDateFormat } from './constants';

interface AppointmentsStore {
  appointmentServiceTypes: Array<string>;
  selectedAppointmentStatuses: Array<AppointmentStatus>;
export const appointmentsStore = createGlobalStore('appointments-app', {
  /* Controls the current calendar display mode (day | week | month) */
  appointmentServiceTypes: [],
  selectedDate: dayjs().startOf('day').format(omrsDateFormat),
  calendarView: 'monthly',
});

export function useAppointmentsStore() {
  return useStore(appointmentsStore);
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
/* Updates the global calendar view mode */
export function setCalendarView(view: 'daily' | 'weekly' | 'monthly') {
  appointmentsStore.setState({ calendarView: view });
}

export function useAppointmentsStore() {
  return useStoreWithActions(appointmentsStore, storeActions);
export function setAppointmentServiceTypes(serviceTypes: Array<string>) {
  appointmentsStore.setState({ appointmentServiceTypes: serviceTypes });
}

export function setSelectedDate(date: string) {
  if (!isOmrsDateStrict(date)) {
    console.warn(
      'esm-appointments-app: setSelectedDate called with incorrectly formatted date. Should be omrsDateFormat string. Received:',
      date,
    );
  }
  appointmentsStore.setState({ selectedDate: date });
}

/* Set up localStorage serialization */

let lastValueOfAppointmentServiceTypes = getFromLocalStorage('openmrs:appointments:serviceTypes');

function getFromLocalStorage(key: string) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : undefined;
}

function setInLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

appointmentsStore.subscribe(({ appointmentServiceTypes }) => {
  if (lastValueOfAppointmentServiceTypes !== appointmentServiceTypes) {
    setInLocalStorage('openmrs:appointments:serviceTypes', appointmentServiceTypes);
    lastValueOfAppointmentServiceTypes = appointmentServiceTypes;
  }
});
