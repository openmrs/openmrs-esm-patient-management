import React from 'react';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';
import { filterByServiceType } from '../utils';

interface AppointmentsByStatusProps {
  appointmentServiceType?: string;
  status: string;
  statusText: string;
  date: string;
}
const AppointmentsByStatus: React.FC<AppointmentsByStatusProps> = ({
  appointmentServiceType,
  status,
  statusText,
  date,
}) => {
  const { appointmentList, isLoading } = useAppointmentList(status, date);

  const appointments = filterByServiceType(appointmentList, appointmentServiceType).map((appointment, index) => {
    return {
      id: `${index}`,
      ...appointment,
    };
  });

  return <AppointmentsTable appointments={appointments} isLoading={isLoading} tableHeading={statusText} />;
};

export default AppointmentsByStatus;
