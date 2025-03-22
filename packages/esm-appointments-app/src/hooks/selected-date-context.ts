import { createContext, useContext } from 'react';
import dayjs from 'dayjs';
import { omrsDateFormat } from '../constants';

export const SelectedDateContext = createContext({
  selectedDate: dayjs().startOf('day').format(omrsDateFormat),
  setSelectedDate: (date: string) => {},
});

export const SelectedDateContextProvider = SelectedDateContext.Provider;

export const useSelectedDateContext = () => {
  const context = useContext(SelectedDateContext);
  if (!context) {
    throw new Error('useSelectedDateContext must be used within a SelectedDateContextProvider');
  }
  return context;
};
