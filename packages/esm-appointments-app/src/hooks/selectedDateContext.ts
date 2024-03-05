import { createContext } from 'react';
import dayjs from 'dayjs';
import { omrsDateFormat } from '../constants';

const SelectedDateContext = createContext({
  selectedDate: dayjs().startOf('day').format(omrsDateFormat),
  setSelectedDate: () => {},
});

export default SelectedDateContext;
