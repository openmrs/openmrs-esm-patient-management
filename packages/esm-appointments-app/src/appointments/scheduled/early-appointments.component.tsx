import React from 'react';
import { useEarlyAppointmentList } from '../../hooks/useAppointmentList';
import { filterByServiceType } from '../utils';
import AppointmentsTable from '../common-components/appointments-table.component';
import { useTranslation } from 'react-i18next';

interface EarlyAppointmentsProps {
  appointmentServiceType?: string;
  date: string;
}

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
