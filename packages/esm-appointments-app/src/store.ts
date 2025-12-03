import { createGlobalStore, isOmrsDateStrict, useStore } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { omrsDateFormat } from './constants';

export const appointmentsStore = createGlobalStore('appointments-app', {
  appointmentServiceTypes: getFromLocalStorage('openmrs:appointments:serviceTypes') || [],
  appointmentProvider: getFromLocalStorage('openmrs:appointments:provider') || {},
  selectedDate: dayjs().startOf('day').format(omrsDateFormat),
});

export function useAppointmentsStore() {
  return useStore(appointmentsStore);
}

export function setAppointmentServiceTypes(serviceTypes: Array<string>) {
  appointmentsStore.setState({ appointmentServiceTypes: serviceTypes });
}

export function setAppointmentProvider(provider: {}) {
  appointmentsStore.setState({ appointmentProvider: provider });
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

let lastValueOfAppointmentProvider = getFromLocalStorage('openmrs:appointments:provider');

function getFromLocalStorage(key: string) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : undefined;
}

function setInLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

appointmentsStore.subscribe(({ appointmentServiceTypes, appointmentProvider }) => {
  if (lastValueOfAppointmentServiceTypes !== appointmentServiceTypes) {
    setInLocalStorage('openmrs:appointments:serviceTypes', appointmentServiceTypes);
    lastValueOfAppointmentServiceTypes = appointmentServiceTypes;
  }

  if (lastValueOfAppointmentProvider?.id !== appointmentProvider?.id) {
    setInLocalStorage('openmrs:appointments:provider', appointmentProvider);
    lastValueOfAppointmentProvider = appointmentProvider;
  }
});
