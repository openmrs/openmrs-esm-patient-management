import { type AppointmentTableColumnFunction } from '../../../types';

export const appointmentTableLocationColumn: AppointmentTableColumnFunction = (key, header) => {
  return {
    key,
    header,
  };
};
