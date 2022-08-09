import React from 'react';
import AppointmentsBaseTable from './appointments-base-table.component';
import { useAppointments } from './appointments-table.resource';
import { useTranslation } from 'react-i18next';

interface BookedAppointmentsProps {
  status: string;
}
const BookedAppointments: React.FC<BookedAppointmentsProps> = ({ status }) => {
  const { appointments, isLoading } = useAppointments(status);
  const { t } = useTranslation();

  return (
    <div>
      <AppointmentsBaseTable
        appointments={appointments}
        isLoading={isLoading}
        tableHeading={t('bookedAppointments', 'Booked appointments')}
      />
    </div>
  );
};

export default BookedAppointments;
