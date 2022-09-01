import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointments } from './appointments-table.resource';
import AppointmentsBaseTable from './appointments-base-table.component';

interface MissedAppointmentsProps {
  status: string;
  title: string;
}
const MissedAppointmentsList: React.FC<MissedAppointmentsProps> = ({ status, title }) => {
  const { appointments, isLoading, mutate } = useAppointments(status);
  const { t } = useTranslation();

  return (
    <div>
      <AppointmentsBaseTable appointments={appointments} isLoading={isLoading} mutate={mutate} tableHeading={title} />
    </div>
  );
};

export default MissedAppointmentsList;
