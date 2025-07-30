import { type AppointmentTableColumnFunction } from '../../../types';

export const appointmentTableServiceTypeColumn: AppointmentTableColumnFunction = (key, header) => {
  return {
    key,
    header,
  };
};
