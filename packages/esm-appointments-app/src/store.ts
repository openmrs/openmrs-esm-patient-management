import dayjs from 'dayjs';
import { type Actions, createGlobalStore, useStoreWithActions } from '@openmrs/esm-framework';
import { omrsDateFormat } from './constants';
import { type AppointmentStatus } from './types';

interface AppointmentsStore {
  appointmentServiceTypes: Array<string>;
  selectedDate: string;
  currentView: 'daily' | 'weekly' | 'monthly';
  selectedAppointmentStatuses: Set<AppointmentStatus>;
}

export const appointmentsStore = createGlobalStore<AppointmentsStore>('appointments-app', {
  appointmentServiceTypes: getFromLocalStorage('openmrs:appointments:serviceTypes') || [],
  selectedDate: dayjs().startOf('day').format(omrsDateFormat),
  currentView: 'monthly',
  selectedAppointmentStatuses: new Set(),
});

export const storeActions = {
  setAppointmentServiceTypes(_, appointmentServiceTypes: Array<string>) {
    return { appointmentServiceTypes };
  },
  setSelectedDate(_, selectedDate: string) {
    return { selectedDate };
  },
  setCurrentView(_, currentView: 'daily' | 'weekly' | 'monthly') {
    return { currentView };
  },
  setSelectedAppointmentStatuses(_, selectedAppointmentStatuses: Set<AppointmentStatus>) {
    return { selectedAppointmentStatuses };
  },
} satisfies Actions<AppointmentsStore>;

export function useAppointmentsStore() {
  return useStoreWithActions(appointmentsStore, storeActions);
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