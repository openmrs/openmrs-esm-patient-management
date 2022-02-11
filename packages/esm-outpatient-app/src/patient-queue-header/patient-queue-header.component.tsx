import React from 'react';
import { useTranslation } from 'react-i18next';
import Calendar16 from '@carbon/icons-react/es/calendar/16';
import Location16 from '@carbon/icons-react/es/location/16';
import { Dropdown } from 'carbon-components-react';
import dayjs from 'dayjs';
import { useSessionUser } from '@openmrs/esm-framework';
import PatientQueueIllustration from './patient-queue-illustration.component';
import styles from './patient-queue-header.scss';

const PatientQueueHeader: React.FC = () => {
  const { t } = useTranslation();
  const items = [
    {
      id: 'option-1',
      text: 'NCD Care',
    },
    {
      id: 'option-2',
      text: 'HIV care',
    },
    {
      id: 'option-3',
      text: 'TB Care',
    },
  ];

  return (
    <div className={styles['patient-header-container']}>
      <div className={styles['header-left']}>
        <PatientQueueIllustration />
        <div className={styles.labels}>
          <p className={styles['bodyShort02']}>{t('outpatients', 'Outpatients')}</p>
          <p className={styles['productiveHeading04']}>{t('home', 'Home')}</p>
        </div>
      </div>
      <div className={styles.headerRightContainer}>
        <div className={styles.locationDateContainer}>
          <Location16 />
          <SessionLoction />
          <span className={styles.dotMark}>.</span>
          <Calendar16 className={styles.calendar} /> <TodayDate />
        </div>
        <div className={styles.dropDownContainer}>
          <label className={styles.viewLabel}>{t('view', 'View:')} </label>
          <Dropdown
            id="typeOfCare"
            label={t('ncdCare', 'NCD Care')}
            type="inline"
            items={items}
            itemToString={(item) => (item ? item.text : '')}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientQueueHeader;

function TodayDate() {
  const today = dayjs(new Date());
  return <span className={styles.dateLabel}>{today.format('DD  MMMM  YYYY')}</span>;
}

function SessionLoction() {
  const userSession = useSessionUser();
  return userSession ? (
    <span className={styles.locationLabel}>{userSession.sessionLocation.display}</span>
  ) : (
    <span></span>
  );
}
