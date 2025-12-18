import { createGlobalStore, getDefaultCalendar, getLocale, isOmrsDateStrict, useStore } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { type CalendarDate, createCalendar, toCalendarDate, parseAbsoluteToLocal } from '@internationalized/date';
import { omrsDateFormat } from './constants';

export const calendar = createCalendar(getDefaultCalendar(getLocale()));

export const appointmentsStore = createGlobalStore('appointments-app', {
  appointmentServiceTypes: getFromLocalStorage('openmrs:appointments:serviceTypes') || [],
  selectedDate: dayjs().startOf('day').format(omrsDateFormat),
});

export function useAppointmentsStore() {
  return useStore(appointmentsStore);
}

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

export function getSelectedCalendarDate(): CalendarDate {
  const { selectedDate } = appointmentsStore.getState();
  const localZoned = parseAbsoluteToLocal(selectedDate);

  return toCalendarDate(localZoned);
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
