import React from 'react';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';
import { filterByServiceType } from '../utils';
import dayjs from 'dayjs';

interface AppointmentsListProps {
  appointmentServiceType?: string;
  status?: string;
  title: string;
  date: string;
}
const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointmentServiceType, status, title, date }) => {
  const { appointmentList, isLoading } = useAppointmentList(status, date);

  const appointments = filterByServiceType(appointmentList, appointmentServiceType).map((appointment, index) => {
    return {
      id: `${index}`,
      ...appointment,
    };
  });

  return <AppointmentsTable appointments={appointments} isLoading={isLoading} tableHeading={title} />;
};

export default AppointmentsList;
