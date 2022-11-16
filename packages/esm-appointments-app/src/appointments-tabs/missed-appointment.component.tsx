import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointments } from './appointments-table.resource';
import AppointmentsBaseTable from './appointments-base-table.component';
import { AppointmentTypes } from '../types';

interface MissedAppointmentsProps {
  status: string;
}

const MissedAppointments: React.FC<MissedAppointmentsProps> = ({ status }) => {
  const { t } = useTranslation();
  const { appointments, isLoading } = useAppointments();

  return (
    <div>
      <AppointmentsBaseTable appointments={appointments} isLoading={isLoading} tableHeading={AppointmentTypes.MISSED} />
    </div>
  );
};

export default MissedAppointments;
