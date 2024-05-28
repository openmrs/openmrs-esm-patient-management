import React, { useCallback, useEffect } from 'react';
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
  useSelectedQueueLocationUuid,
} from '../helpers/helpers';
import styles from './patient-queue-header.scss';

const PatientQueueHeader: React.FC<{ title?: string; hideLocationDropdown?: boolean }> = ({
  title,
  hideLocationDropdown,
}) => {
  const { t } = useTranslation();
  const { queueLocations, isLoading, error } = useQueueLocations();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;
  const currentQueueLocationName = useSelectedQueueLocationName();
  const currentQueueLocationUuid = useSelectedQueueLocationUuid();

  const handleQueueLocationChange = useCallback(({ selectedItem }) => {
    if (selectedItem.id === 'all') {
      updateSelectedQueueLocationUuid(null);
      updateSelectedQueueLocationName(null);
    } else {
      updateSelectedQueueLocationUuid(selectedItem.id);
      updateSelectedQueueLocationName(selectedItem.name);
      updateSelectedServiceName('All');
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !error && !currentQueueLocationUuid) {
      if (queueLocations.length === 1) {
        handleQueueLocationChange({ selectedItem: queueLocations[0] });
      }
      if (queueLocations.some((location) => location.id === userSession?.sessionLocation?.uuid)) {
        handleQueueLocationChange({
          selectedItem: {
            id: userSession?.sessionLocation?.uuid,
            name: userSession?.sessionLocation?.display,
          },
        });
      }
    }
  }, [
    queueLocations,
    currentQueueLocationName,
    currentQueueLocationUuid,
    isLoading,
    error,
    userSession?.sessionLocation?.uuid,
  ]);

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
            {!hideLocationDropdown && (
              <Dropdown
                aria-label="Select queue location"
                className={styles.dropdown}
                id="queueLocationDropdown"
                label={currentQueueLocationName ?? t('all', 'All')}
                items={
                  queueLocations.length !== 1
                    ? [{ id: 'all', name: t('all', 'All') }, ...queueLocations]
                    : queueLocations
                }
                itemToString={(item) => (item ? item.name : '')}
                titleText={t('location', 'Location')}
                type="inline"
                onChange={handleQueueLocationChange}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientQueueHeader;
