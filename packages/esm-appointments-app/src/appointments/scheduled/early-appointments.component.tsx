import React from 'react';
import { useTranslation } from 'react-i18next';
import { filterByProvider, filterByServiceType } from '../utils';
import { useEarlyAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';
import { useAppointmentsStore } from '../../store';

interface EarlyAppointmentsProps {
  appointmentServiceTypes?: Array<string>;
  date: string;
}

/**
 * Component to display early appointments
 * Note that although we define this extension in routes.jsx, we currently don't wire it into the scheduled-appointments-panels-slot by default because it requests a custom endpoint (see useEarlyAppointments) not provided by the standard Bahmni Appointments module
 */
const EarlyAppointments: React.FC<EarlyAppointmentsProps> = ({ appointmentServiceTypes, date }) => {
  const { t } = useTranslation();
  const { earlyAppointmentList, isLoading } = useEarlyAppointmentList(date);
  const { appointmentProvider } = useAppointmentsStore();

  const byServiceType = filterByServiceType(earlyAppointmentList, appointmentServiceTypes).map((appointment, index) => {
    return {
      id: `${index}`,
      ...appointment,
    };
  });

  const byProvider = filterByProvider(earlyAppointmentList, appointmentProvider).map((appointment, index) => ({
    id: `${index}`,
    ...appointment,
  }));

  const appointments = byProvider.filter((appt) => byServiceType.some((s) => s.uuid === appt.uuid));

  const allAppointments = earlyAppointmentList.map((appointment, index) => ({
    id: `${index}`,
    ...appointment,
  }));

  return (
    <AppointmentsTable
      appointments={appointments}
      allAppointments={allAppointments}
      isLoading={isLoading}
      tableHeading={t('cameEarly', 'Came Early')}
    />
  );
};

export default EarlyAppointments;
