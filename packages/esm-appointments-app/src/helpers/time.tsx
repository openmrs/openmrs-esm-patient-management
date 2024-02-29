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

const initialState = { selectedDate: dayjs(new Date().setHours(0, 0, 0, 0)).format(omrsDateFormat) };

export function getSelectedDate() {
  return getGlobalStore<{ selectedDate: string }>('appointment-selected-date', initialState);
}

export function changeSelectedDate(updatedDate: string | Date | dayjs.Dayjs) {
  const store = getSelectedDate();
  store.setState({ selectedDate: dayjs(updatedDate).hour(0).minute(0).second(0).format(omrsDateFormat) });
}

export const useSelectedDate = () => {
  const [selectedDate, setSelectedDate] = useState(initialState.selectedDate);

  useEffect(() => {
    getSelectedDate().subscribe(({ selectedDate }) => setSelectedDate(selectedDate));
  }, []);

  return { selectedDate };
};
