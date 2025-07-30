import { type AppointmentTableColumnFunction } from '../../../types';

export const appointmentTableProviderColumn: AppointmentTableColumnFunction = (key, header) => {
  return {
    key,
    header,
  };
};
