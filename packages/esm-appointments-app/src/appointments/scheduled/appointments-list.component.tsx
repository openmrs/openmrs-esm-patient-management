import React from 'react';
import { filterByServiceType } from '../utils';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';

interface AppointmentsListProps {
  appointmentServiceType?: string;
  status?: string;
  title: string;
  date: string;
}
const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointmentServiceType, status, title, date }) => {
  const { appointmentList, isLoading } = useAppointmentList(status, date);

  const appointments = filterByServiceType(appointmentList, appointmentServiceType).map((appointment) => ({
    id: appointment.uuid,
    ...appointment,
  }));

  return <AppointmentsTable appointments={appointments} isLoading={isLoading} tableHeading={title} />;
};

export default AppointmentsList;
