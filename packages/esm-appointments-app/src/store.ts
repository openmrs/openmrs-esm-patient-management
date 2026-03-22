import { createGlobalStore, isOmrsDateStrict, useStore } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { omrsDateFormat } from './constants';

/* Global store for appointments calendar */
export const appointmentsStore = createGlobalStore('appointments-app', {
  appointmentServiceTypes: [],

  /* Selected date used across monthly, weekly, and daily views */
  selectedDate: dayjs().startOf('day').format(omrsDateFormat),

  /* Controls current calendar view */
  calendarView: 'monthly',
});

/* Hook to access global store */
export function useAppointmentsStore() {
  return useStore(appointmentsStore);
}

/* Update calendar view (month / week / day) */
export function setCalendarView(view: 'daily' | 'weekly' | 'monthly') {
  appointmentsStore.setState({ calendarView: view });
}

/* Update selected date */
export function setSelectedDate(date: string) {
  if (!isOmrsDateStrict(date)) {
    console.warn(
      'esm-appointments-app: setSelectedDate called with incorrectly formatted date. Should be omrsDateFormat string. Received:',
      date,
    );
  }

  appointmentsStore.setState({ selectedDate: date });
}

/* Update service filters */
export function setAppointmentServiceTypes(serviceTypes: Array<string>) {
  appointmentsStore.setState({ appointmentServiceTypes: serviceTypes });
}

/* Persist service types in localStorage */
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
