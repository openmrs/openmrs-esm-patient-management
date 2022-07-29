import React from 'react';
import { useTranslation } from 'react-i18next';
import Calendar16 from '@carbon/icons-react/es/calendar/16';
import Location16 from '@carbon/icons-react/es/location/16';
import { formatDate, useSession } from '@openmrs/esm-framework';
import styles from './appointments-header.scss';
import AppointmentsIllustration from './appointments-illustration.component';

const AppointmentsHeader: React.FC<{ title: string }> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();
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
          <Location16 />
          <span className={styles.value}>{location}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar16 />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsHeader;
