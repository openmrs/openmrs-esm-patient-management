import { createContext, useContext } from 'react';
import dayjs from 'dayjs';
import { omrsDateFormat } from '../constants';

export interface SelectedDateContextProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const SelectedDateContext = createContext<SelectedDateContextProps>({
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
