import React from 'react';
import { useTranslation } from 'react-i18next';
import PatientQueueIllustration from './patient-queue-illustration.component';
import styles from './patient-queue-header.scss';

const PatientQueueHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles['patient-header-container']}>
      <div className={styles['header-left']}>
        <PatientQueueIllustration />
        <div className={styles.labels}>
          <p className={styles['bodyShort02']}>{t('outpatients', 'Outpatients')}</p>
          <p className={styles['productiveHeading04']}>{t('home', 'Home')}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientQueueHeader;
