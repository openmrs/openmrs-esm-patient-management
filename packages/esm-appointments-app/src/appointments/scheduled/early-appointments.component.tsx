import React from 'react';
import { useEarlyAppointmentList } from '../../hooks/useAppointmentList';
import { filterByServiceType } from '../utils';
import AppointmentsTable from '../common-components/appointments-table.component';
import { useTranslation } from 'react-i18next';

interface EarlyAppointmentsProps {
  appointmentServiceType?: string;
  date: string;
}

/**
 * Component to display early appointments
 * Note that although we define this extension in routes.jsx, we currently don't wire it into the scheduled-appointments-panels-slot by default because it requests a custom endpoint (see useEarlyAppointments) not provided by the standard Bahmni Appointments module
 */
const EarlyAppointments: React.FC<EarlyAppointmentsProps> = ({ appointmentServiceType, date }) => {
  const { t } = useTranslation();
  const { earlyAppointmentList, isLoading } = useEarlyAppointmentList(date);

  const appointments = filterByServiceType(earlyAppointmentList, appointmentServiceType).map((appointment, index) => {
    return {
      id: `${index}`,
      ...appointment,
    };
  });

  return (
    <AppointmentsTable appointments={appointments} isLoading={isLoading} tableHeading={t('cameEarly', 'Came Early')} />
  );
};

export default EarlyAppointments;
