import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { formatDate, useSession } from '@openmrs/esm-framework';
import AppointmentsIllustration from './appointments-illustration.component';
import styles from './appointments-header.scss';
import { DatePicker, DatePickerInput } from '@carbon/react';
import dayjs from 'dayjs';
import { changeStartDate } from '../helpers';

const AppointmentsHeader: React.FC<{ title: string }> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();
  const datePickerRef = useRef(null);
  const [appointmentDate, setDateTime] = useState(new Date());
  const location = session?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <AppointmentsIllustration />
        <div className={styles['page-labels']}>
          <p>{t('appointments', 'Appointments')}</p>
          <p className={styles['page-name']}>{title}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{location}</span>
          <span className={styles.middot}>&middot;</span>
          <DatePicker
            onChange={([date]) => changeStartDate(new Date(date))}
            ref={datePickerRef}
            dateFormat="d-M-Y"
            datePickerType="single">
            <DatePickerInput
              style={{ backgroundColor: 'transparent', border: 'none', maxWidth: '10rem' }}
              id="date-picker-calendar-id"
              placeholder="DD-MMM-YYYY"
              labelText="DD-MMM-YYYY"
              type="text"
              value={dayjs(appointmentDate).format('DD MMM YYYY')}
            />
          </DatePicker>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsHeader;
