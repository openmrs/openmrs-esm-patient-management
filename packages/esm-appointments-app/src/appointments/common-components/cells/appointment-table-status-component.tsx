import { type AppointmentTableColumnFunction } from '../../../types';

export const appointmentTableStatusColumn: AppointmentTableColumnFunction = (key, header) => {
  return {
    key,
    header,
  };
};
