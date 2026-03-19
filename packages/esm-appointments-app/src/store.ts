import { createGlobalStore, isOmrsDateStrict, useStoreWithActions } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { omrsDateFormat } from './constants';
import { type AppointmentStatus } from './types';

interface AppointmentsStore {
  appointmentServiceTypes: Array<string>;
  selectedDate: string;
  selectedAppointmentStatuses: Set<AppointmentStatus>;
}

export const appointmentsStore = createGlobalStore<AppointmentsStore>('appointments-app', {
  appointmentServiceTypes: getFromLocalStorage('openmrs:appointments:serviceTypes') || [],
  selectedDate: dayjs().startOf('day').format(omrsDateFormat),
  currentView: 'monthly' as 'daily' | 'weekly' | 'monthly',
  selectedAppointmentStatuses: new Set(),
});

export function useAppointmentsStore() {
  return useStoreWithActions(appointmentsStore, {
    setAppointmentServiceTypes(_, appointmentServiceTypes: Array<string>) {
      return { appointmentServiceTypes };
    },
    setSelectedDate(_, selectedDate) {
      if (!isOmrsDateStrict(selectedDate)) {
        console.warn(
          'esm-appointments-app: setSelectedDate called with incorrectly formatted date. Should be omrsDateFormat string. Received:',
          selectedDate,
        );
      }
      return { selectedDate };
    },
    setSelectedAppointmentStatuses(_, selectedAppointmentStatuses: Set<AppointmentStatus>) {
      return { selectedAppointmentStatuses };
    },
  });
}

export function setCurrentView(view: 'daily' | 'weekly' | 'monthly') {
  appointmentsStore.setState({ currentView: view });
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
