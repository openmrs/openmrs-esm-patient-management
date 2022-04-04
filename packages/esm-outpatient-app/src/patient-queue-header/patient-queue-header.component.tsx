import React from 'react';
import { useTranslation } from 'react-i18next';
import Calendar16 from '@carbon/icons-react/es/calendar/16';
import Location16 from '@carbon/icons-react/es/location/16';
import { Dropdown } from 'carbon-components-react';
import { formatDate, useSessionUser } from '@openmrs/esm-framework';
import PatientQueueIllustration from './patient-queue-illustration.component';
import styles from './patient-queue-header.scss';

const PatientQueueHeader: React.FC = () => {
  const { t } = useTranslation();
  const userSession = useSessionUser();
  const userLocation = userSession?.sessionLocation?.display;
  const careTypes = [
    {
      id: 'option-1',
      text: t('ncdCare', 'NCD Care'),
    },
    {
      id: 'option-2',
      text: t('hivCare', 'HIV Care'),
    },
    {
      id: 'option-3',
      text: t('tbCare', 'TB Care'),
    },
  ];

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <PatientQueueIllustration />
        <div className={styles['page-labels']}>
          <p>{t('outpatients', 'Outpatients')}</p>
          <p className={styles['page-name']}>{t('home', 'Home')}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
          <Location16 />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar16 />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
        <div className={styles.dropdown}>
          <label className={styles.view}>{t('view', 'View')}:</label>
          <Dropdown
            id="typeOfCare"
            label={t('careType', 'Type of Care')}
            initialSelectedItem={careTypes[0]}
            items={careTypes}
            itemToString={(item) => (item ? item.text : '')}
            type="inline"
          />
        </div>
      </div>
    </div>
  );
};

export default PatientQueueHeader;
