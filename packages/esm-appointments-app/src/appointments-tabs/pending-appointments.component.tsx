import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointments } from './appointments-table.resource';
import AppointmentsBaseTable from './appointments-base-table.component';

const PendingAppointments: React.FC = () => {
  const { t } = useTranslation();
  const { appointments, isLoading } = useAppointments();
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'Scheduled');
  return (
    <div>
      <AppointmentsBaseTable
        appointments={pendingAppointments}
        isLoading={isLoading}
        tableHeading={t('pending', 'Pending')}
      />
    </div>
  );
};

export default PendingAppointments;
