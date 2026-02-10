import React, { useMemo } from 'react';
import { filterByProvider, filterByServiceType } from '../utils';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';
import { useAppointmentsStore } from '../../store';

interface AppointmentsListProps {
  appointmentServiceTypes?: Array<string>;
  date: string;
  excludeCancelledAppointments?: boolean;
  status?: string;
  title: string;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointmentServiceTypes, date, status, title }) => {
  const { appointmentList, isLoading } = useAppointmentList(status, date);

  const { appointmentProvider } = useAppointmentsStore();

  const appointmentsFilteredByServiceType = filterByServiceType(appointmentList, appointmentServiceTypes).map(
    (appointment) => ({
      id: appointment.uuid,
      ...appointment,
    }),
  );

  const appointmentsFilteredByProvider = filterByProvider(appointmentList, appointmentProvider).map((appointment) => ({
    id: appointment.uuid,
    ...appointment,
  }));

  const activeAppointments = useMemo(() => {
    return appointmentsFilteredByProvider.filter((appt) =>
      appointmentsFilteredByServiceType.some((s) => s.uuid === appt.uuid),
    );
  }, [appointmentsFilteredByProvider, appointmentsFilteredByServiceType]);

  return (
    <AppointmentsTable
      appointments={activeAppointments}
      allAppointments={appointmentList.map((appointment) => ({
        id: appointment.uuid,
        ...appointment,
      }))}
      hasActiveFilters={appointmentServiceTypes?.length > 0 || appointmentProvider}
      isLoading={isLoading}
      tableHeading={title}
    />
  );
};

export default AppointmentsList;
