import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageHeaderContent, AppointmentsPictogram, OpenmrsDatePicker } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import { useAppointmentsStore, setSelectedDate } from '../store';
import styles from './appointments-header.scss';

interface AppointmentHeaderProps {
  title: string;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();

  return (
    <PageHeader className={styles.header} data-testid="appointments-header">
      <PageHeaderContent illustration={<AppointmentsPictogram />} title={title} />
      <div className={styles.rightJustifiedItems}>
        <OpenmrsDatePicker
          data-testid="appointment-date-picker"
          id="appointment-date-picker"
          labelText=""
          onChange={(date) => setSelectedDate(dayjs(date).startOf('day').format(omrsDateFormat))}
          value={dayjs(selectedDate).toDate()}
        />
      </div>
    </PageHeader>
  );
};

export default AppointmentsHeader;
