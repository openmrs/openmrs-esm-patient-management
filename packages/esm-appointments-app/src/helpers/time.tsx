import { getGlobalStore } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { omrsDateFormat } from '../constants';

export type amPm = 'AM' | 'PM';

export const convertTime12to24 = (time12h, timeFormat: amPm) => {
  let [hours, minutes] = time12h?.split(':');

  if (hours === '12' && timeFormat === 'AM') {
    hours = '00';
  }

  if (timeFormat === 'PM') {
    hours = hours === '12' ? hours : parseInt(hours, 10) + 12;
  }

  return [hours, minutes];
};

const initialState = { appointmentDate: dayjs(new Date().setHours(0, 0, 0, 0)).format(omrsDateFormat) };

export function getStartDate() {
  return getGlobalStore<{ appointmentDate: string | Date }>('appointmentStartDate', initialState);
}

export function changeStartDate(updatedDate: string | Date) {
  const store = getStartDate();
  store.setState({ appointmentDate: dayjs(new Date(updatedDate).setHours(0, 0, 0, 0)).format(omrsDateFormat) });
}

export const useAppointmentDate = () => {
  const [currentAppointmentDate, setCurrentAppointmentDate] = useState(initialState.appointmentDate);

  useEffect(() => {
    getStartDate().subscribe(({ appointmentDate }) => setCurrentAppointmentDate(appointmentDate.toString()));
  }, []);

  return currentAppointmentDate;
};
