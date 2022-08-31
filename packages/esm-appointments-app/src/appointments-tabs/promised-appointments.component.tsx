import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointments } from './appointments-table.resource';
import AppointmentsBaseTable from './appointments-base-table.component';

interface PromisedAppointmentsProps {
  status: string;
}
const PromisedAppointments: React.FC<PromisedAppointmentsProps> = ({ status }) => {
  const { appointments, isLoading, mutate } = useAppointments(status);
  const { t } = useTranslation();

  return (
    <div>
      <AppointmentsBaseTable
        appointments={appointments}
        isLoading={isLoading}
        mutate={mutate}
        tableHeading={t('promisedPateints', 'Promised Pateints')}
      />
    </div>
  );
};

export default PromisedAppointments;
