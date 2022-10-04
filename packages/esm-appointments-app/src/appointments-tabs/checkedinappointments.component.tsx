import React from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentsBaseTable from './appointments-base-table.component';
import { useAppointments } from './appointments-table.resource';

interface checkedInAppointmentsProps {
  status: string;
}

const CheckInAppointments: React.FC<checkedInAppointmentsProps> = ({ status }) => {
  const { t } = useTranslation();
  const { appointments, isLoading } = useAppointments(status);

  return (
    <div>
      <AppointmentsBaseTable
        appointments={appointments}
        isLoading={isLoading}
        tableHeading={t('checkedInAppointments', 'CheckedIn appointments')}
      />
    </div>
  );
};

export default CheckInAppointments;
