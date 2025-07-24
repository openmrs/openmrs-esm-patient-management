import React from 'react';
import { useTranslation } from 'react-i18next';
import { filterByServiceType } from '../utils';
import { useEarlyAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';

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

  const appointments = filterByServiceType(earlyAppointmentList, appointmentServiceTypes).map((appointment, index) => {
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
