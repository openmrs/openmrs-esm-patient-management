import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownSkeleton, InlineNotification } from '@carbon/react';
import { useConfig, useSession, PageHeader, PageHeaderContent, ServiceQueuesPictogram } from '@openmrs/esm-framework';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import {
  updateSelectedQueueLocationUuid,
  updateSelectedQueueLocationName,
  updateSelectedService,
  useServiceQueuesStore,
} from '../store/store';
import type { ConfigObject } from '../config-schema';
import styles from './patient-queue-header.scss';

interface PatientQueueHeaderProps {
  title?: string | JSX.Element;
  showFilters: boolean;
  actions?: React.ReactNode;
}

const PatientQueueHeader: React.FC<PatientQueueHeaderProps> = ({ title, showFilters, actions }) => {
  const { t } = useTranslation();
  const { queueLocations, isLoading, error } = useQueueLocations();
  const { dashboardTitle } = useConfig<ConfigObject>();
  const userSession = useSession();
  const { selectedQueueLocationName, selectedQueueLocationUuid } = useServiceQueuesStore();

  const showLocationDropdown = showFilters && queueLocations.length > 1;

  const handleQueueLocationChange = useCallback(
    ({ selectedItem }) => {
      if (selectedItem.id === 'all') {
        updateSelectedQueueLocationUuid(null);
        updateSelectedQueueLocationName(null);
      } else {
        updateSelectedQueueLocationUuid(selectedItem.id);
        updateSelectedQueueLocationName(selectedItem.name);
        updateSelectedService(null, t('all', 'All'));
      }
    },
    [t],
  );

  useEffect(() => {
    if (!isLoading && !error && !selectedQueueLocationUuid) {
      if (queueLocations.length === 1) {
        handleQueueLocationChange({ selectedItem: queueLocations[0] });
      }
      if (
        queueLocations.some((location) => location.id === userSession?.sessionLocation?.uuid) &&
        selectedQueueLocationUuid
      ) {
        handleQueueLocationChange({
          selectedItem: {
            id: userSession?.sessionLocation?.uuid,
            name: userSession?.sessionLocation?.display,
          },
        });
      }
    }
  }, [
    selectedQueueLocationName,
    selectedQueueLocationUuid,
    error,
    handleQueueLocationChange,
    isLoading,
    queueLocations,
    userSession?.sessionLocation?.display,
    userSession?.sessionLocation?.uuid,
  ]);

  return (
    <PageHeader className={styles.header} data-testid="patient-queue-header">
      <PageHeaderContent
        title={title ? title : t(dashboardTitle.key, dashboardTitle.value)}
        illustration={<ServiceQueuesPictogram />}
      />
      <div className={styles.dropdownContainer}>
        {isLoading ? (
          <div className={styles.dropdownSkeletonContainer}>
            <DropdownSkeleton />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <InlineNotification
              kind="error"
              title={t('failedToLoadLocations', 'Failed to load locations')}
              hideCloseButton
            />
          </div>
        ) : (
          showLocationDropdown && (
            <Dropdown
              aria-label={t('selectQueueLocation', 'Select a queue location')}
              className={styles.dropdown}
              id="queueLocationDropdown"
              label={selectedQueueLocationName ?? t('all', 'All')}
              items={
                queueLocations.length !== 1 ? [{ id: 'all', name: t('all', 'All') }, ...queueLocations] : queueLocations
              }
              itemToString={(item: { name: string } | null) => (item ? item.name : '')}
              titleText={t('location', 'Location')}
              type="inline"
              onChange={handleQueueLocationChange}
            />
          )
        )}
        {actions}
      </div>
    </PageHeader>
  );
};

export default PatientQueueHeader;
