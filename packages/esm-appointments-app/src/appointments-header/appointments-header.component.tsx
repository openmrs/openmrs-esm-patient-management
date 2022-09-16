import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { formatDate, useSession } from '@openmrs/esm-framework';
import AppointmentsIllustration from './appointments-illustration.component';
import styles from './appointments-header.scss';
import { DatePicker, DatePickerInput } from '@carbon/react';

const AppointmentsHeader: React.FC<{ title: string }> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();
  const datePickerRef = useRef(null);
  const location = session?.sessionLocation?.display;

  const handleClick = () => {
    datePickerRef?.current && console.log(datePickerRef.current);
  };

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
          <Calendar size={16} />
          <span ref={datePickerRef} className={styles.value}>
            {formatDate(new Date(), { mode: 'standard' })}
          </span>
          <DatePicker ref={datePickerRef} dateFormat="m/d/Y" datePickerType="single">
            <DatePickerInput
              id="date-picker-calendar-id"
              placeholder="mm/dd/yyyy"
              labelText="Date picker label"
              type="text"
              onClick={handleClick}
            />
          </DatePicker>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsHeader;
