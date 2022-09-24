import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointments } from './appointments-table.resource';
import AppointmentsBaseTable from './appointments-base-table.component';

interface ScheduledAppointmentsProps {
  status: string;
}

const ScheduledAppointments: React.FC<ScheduledAppointmentsProps> = ({ status }) => {
  const { t } = useTranslation();
  const { appointments, isLoading } = useAppointments(status);

  return (
    <div>
      <AppointmentsBaseTable
        appointments={appointments}
        isLoading={isLoading}
        tableHeading={t('completedAppointments', 'Completed appointments')}
      />
    </div>
  );
};

export default ScheduledAppointments;
