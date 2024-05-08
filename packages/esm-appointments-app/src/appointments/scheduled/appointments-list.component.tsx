import React from 'react';
import { filterByServiceType } from '../utils';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';

interface AppointmentsListProps {
  appointmentServiceType?: string;
  status?: string;
  title: string;
  date: string;
  filterCancelled?: boolean;
}
const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointmentServiceType,
  status,
  title,
  date,
  filterCancelled = false,
}) => {
  const { appointmentList, isLoading } = useAppointmentList(status, date);

  const appointments = filterByServiceType(appointmentList, appointmentServiceType).map((appointment) => ({
    id: appointment.uuid,
    ...appointment,
  }));

  const activeAppointments = filterCancelled
    ? appointments.filter((appointment) => appointment.status !== 'Cancelled')
    : appointments;
  return <AppointmentsTable appointments={activeAppointments} isLoading={isLoading} tableHeading={title} />;
};

export default AppointmentsList;
