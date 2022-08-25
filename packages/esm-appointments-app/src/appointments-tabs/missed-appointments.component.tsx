import React from 'react';
import { useAppointments } from './appointments-table.resource';
import { useTranslation } from 'react-i18next';
import MissedAppointmentsBaseTable from './missed-appointment-base-table.component';

interface MissedAppointmentsProps {
  status: string;
}
const MissedAppointments: React.FC<MissedAppointmentsProps> = ({ status }) => {
  const { t } = useTranslation();
  const { appointments, isLoading } = useAppointments(status);

  return (
    <div>
      <MissedAppointmentsBaseTable
        appointments={appointments}
        isLoading={isLoading}
        tableHeading={t('missedAppointments', 'Missed appointments List')}
        paragraph={t('paragraph', 'A list of patients that have missed their appointmet')}
      />
    </div>
  );
};

export default MissedAppointments;
