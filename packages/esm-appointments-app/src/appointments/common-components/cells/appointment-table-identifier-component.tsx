import { type AppointmentTableColumnFunction } from '../../../types';

export const appointmentTableIdentifierColumn: AppointmentTableColumnFunction = (key, header) => {
  return {
    key,
    header,
  };
};
