import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { Dropdown } from '@carbon/react';
import { formatDate, useConfig, useSession } from '@openmrs/esm-framework';
import sortBy from 'lodash/sortBy';
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
import { type ConfigObject } from '../config-schema';
import { useIsQueueLocation } from '../hooks/useIsQueueLocation';

const PatientQueueHeader: React.FC<{ title?: string }> = ({ title }) => {
  const { t } = useTranslation();
  const { limitQueueLocationToSessionLocation } = useConfig() as ConfigObject;
  const { queueLocations, isLoading, error } = useQueueLocations(limitQueueLocationToSessionLocation);
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;
  const currentQueueLocationName = useSelectedQueueLocationName();
  const currentQueueLocationUuid = useSelectedQueueLocationUuid();
  const { isQueueLocation: isCurrentLocationAQueueLocation } = useIsQueueLocation(currentQueueLocationUuid);

  const locationDropdownOptions = useMemo(() => {
    const locations =
      queueLocations?.length > 1 ? [{ id: 'all', name: t('all', 'All') }, ...queueLocations] : queueLocations;
    return sortBy(locations, ['name']);
  }, [queueLocations]);

  const handleQueueLocationChange = useCallback(({ selectedItem }) => {
    if (selectedItem.id === 'all') {
      updateSelectedQueueLocationUuid(null);
      updateSelectedQueueLocationName(null);
      sessionStorage.setItem('queueLocationName', null);
      sessionStorage.setItem('queueLocationUuid', null);
    } else {
      updateSelectedQueueLocationUuid(selectedItem.id);
      updateSelectedQueueLocationName(selectedItem.name);
      updateSelectedServiceName('All');
      sessionStorage.setItem('queueLocationName', selectedItem.name);
      sessionStorage.setItem('queueLocationUuid', selectedItem.id);
    }
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
              label={isCurrentLocationAQueueLocation ? currentQueueLocationName : t('all', 'All')}
              items={locationDropdownOptions}
              itemToString={(item) => (item ? item.name : '')}
              titleText={t('location', 'Location')}
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
