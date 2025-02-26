import React, { useMemo } from 'react';
import { filterByServiceType } from '../utils';
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

  const appointmentsFilteredByServiceType = filterByServiceType(appointmentList, appointmentServiceTypes).map(
    (appointment) => ({
      id: appointment.uuid,
      ...appointment,
    }),
  );

  const activeAppointments = useMemo(() => {
    return excludeCancelledAppointments
      ? appointmentsFilteredByServiceType.filter((appointment) => appointment.status !== 'Cancelled')
      : appointmentsFilteredByServiceType;
  }, [excludeCancelledAppointments, appointmentsFilteredByServiceType]);

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
