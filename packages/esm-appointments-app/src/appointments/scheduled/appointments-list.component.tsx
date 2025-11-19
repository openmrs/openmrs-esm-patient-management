import React, { useMemo } from 'react';
import { filterByProvider, filterByServiceType } from '../utils';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';

interface AppointmentsListProps {
  appointmentServiceTypes?: Array<string>;
  appointmentProviders?: Array<string>;
  date: string;
  excludeCancelledAppointments?: boolean;
  status?: string;
  title: string;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointmentServiceTypes,
  appointmentProviders,
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

  const appointmentsFilteredByProvider = filterByProvider(appointmentList, appointmentProviders).map((appointment) => ({
    id: appointment.uuid,
    ...appointment,
  }));

  const activeAppointments = useMemo(() => {
    const byProvider = appointmentsFilteredByProvider;

    const byServiceType = appointmentsFilteredByServiceType;

    const combined = byProvider.filter((appt) => byServiceType.some((s) => s.uuid === appt.uuid));

    const finalList = excludeCancelledAppointments
      ? combined.filter((appointment) => appointment.status !== 'Cancelled')
      : combined;

    return finalList;
  }, [appointmentsFilteredByProvider, appointmentsFilteredByServiceType, excludeCancelledAppointments]);

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
