import React from 'react';
import AppointmentsBaseTable from './appointments-base-table.component';
import { useAppointments } from './appointments-table.resource';
import { useTranslation } from 'react-i18next';

interface CompletedAppointmentsProps {
  status: string;
}
const CompletedAppointments: React.FC<CompletedAppointmentsProps> = ({ status }) => {
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

export default CompletedAppointments;
