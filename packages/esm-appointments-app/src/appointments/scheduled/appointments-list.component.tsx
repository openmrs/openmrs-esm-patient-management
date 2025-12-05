import React, { useMemo } from 'react';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';

interface AppointmentsListProps {
  appointmentServiceTypes?: Array<string>;
  date: string;
  excludeCancelledAppointments?: boolean;
  status?: string;
  title: string;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointmentServiceTypes,
  date,
  excludeCancelledAppointments = false,
  status,
  title,
}) => {
  const { appointmentList, isLoading } = useAppointmentList(status, date);

  const appointmentsWithId = appointmentList.map((appointment) => ({
    id: appointment.uuid,
    ...appointment,
  }));

  const activeAppointments = useMemo(() => {
    return excludeCancelledAppointments
      ? appointmentsWithId.filter((appointment) => appointment.status !== 'Cancelled')
      : appointmentsWithId;
  }, [excludeCancelledAppointments, appointmentsWithId]);

  return (
    <AppointmentsTable
      appointments={activeAppointments}
      hasActiveFilters={appointmentServiceTypes?.length > 0}
      isLoading={isLoading}
      tableHeading={title}
    />
  );
};

export default AppointmentsList;
