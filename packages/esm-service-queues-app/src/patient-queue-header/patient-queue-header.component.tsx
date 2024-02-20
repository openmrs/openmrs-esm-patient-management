import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { Dropdown } from '@carbon/react';
import { formatDate, useSession } from '@openmrs/esm-framework';
import PatientQueueIllustration from './patient-queue-illustration.component';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';

import {
  updateSelectedQueueLocationUuid,
  updateSelectedQueueLocationName,
  updateSelectedServiceName,
  useSelectedQueueLocationName,
} from '../helpers/helpers';
import styles from './patient-queue-header.scss';

const PatientQueueHeader: React.FC<{ title?: string }> = ({ title }) => {
  const { t } = useTranslation();
  const { queueLocations, isLoading, error } = useQueueLocations();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;
  const currentQueueLocationName = useSelectedQueueLocationName();

  const handleQueueLocationChange = useCallback(({ selectedItem }) => {
    updateSelectedQueueLocationUuid(selectedItem.id);
    updateSelectedQueueLocationName(selectedItem.name);
    updateSelectedServiceName('All');
  }, []);

  return (
    <>
      <div className={styles.header} data-testid="patient-queue-header">
        <div className={styles['left-justified-items']}>
          <PatientQueueIllustration />
          <div className={styles['page-labels']}>
            <p>{t('serviceQueues', 'Service queues')}</p>
            <p className={styles['page-name']}>{title ?? t('home', 'Home')}</p>
          </div>
        </div>
        <div className={styles['right-justified-items']}>
          <div className={styles['date-and-location']}>
            <Location size={16} />
            <span className={styles.value}>{userLocation}</span>
            <span className={styles.middot}>&middot;</span>
            <Calendar size={16} />
            <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
          </div>
          <div className={styles.dropdownContainer}>
            <Dropdown
              aria-label="Select queue location"
              className={styles.dropdown}
              id="queueLocationDropdown"
              label={currentQueueLocationName ?? t('all', 'All')}
              items={[{ id: 'all', name: t('all', 'All') }, ...queueLocations]}
              itemToString={(item) => (item ? item.name : '')}
              titleText={t('view', 'View')}
              type="inline"
              onChange={handleQueueLocationChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientQueueHeader;
