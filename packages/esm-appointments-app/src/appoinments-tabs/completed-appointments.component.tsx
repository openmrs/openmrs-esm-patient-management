import React from 'react';
import AppointmentsBaseTable from './appointments-base-table.component';
import { useAppointments } from './appointments-table.resource';
import { useTranslation } from 'react-i18next';

const CompletedAppointments: React.FC = () => {
  const { appointments, isLoading } = useAppointments();
  const { t } = useTranslation();

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
