import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointments } from './appointments-table.resource';
import AppointmentsBaseTable from './appointments-base-table.component';

interface LTFUAppointmentsProps {
  status: string;
}
const LTFUAppointments: React.FC<LTFUAppointmentsProps> = ({ status }) => {
  const { appointments, isLoading, mutate } = useAppointments(status);
  const { t } = useTranslation();

  return (
    <div>
      <AppointmentsBaseTable
        appointments={appointments}
        isLoading={isLoading}
        mutate={mutate}
        tableHeading={t('lostToFollowupAppointments', 'Lost To Followup Appointments')}
      />
    </div>
  );
};

export default LTFUAppointments;
