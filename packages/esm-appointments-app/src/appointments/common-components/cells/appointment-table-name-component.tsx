import { type AppointmentTableColumnFunction } from '../../../types';

export const appointmentTableNameColumn: AppointmentTableColumnFunction = (key, header) => {
  return {
    key,
    header,
  };
};
