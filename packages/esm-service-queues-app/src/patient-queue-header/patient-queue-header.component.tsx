import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import { useConfig, useSession, PageHeader, PageHeaderContent, ServiceQueuesPictogram } from '@openmrs/esm-framework';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import {
  updateSelectedQueueLocationUuid,
  updateSelectedQueueLocationName,
  updateSelectedService,
  useSelectedQueueLocationName,
  useSelectedQueueLocationUuid,
} from '../helpers/helpers';
import type { ConfigObject } from '../config-schema';
import styles from './patient-queue-header.scss';

interface PatientQueueHeaderProps {
  title?: string | JSX.Element;
  showLocationDropdown: boolean;
  actions?: React.ReactNode;
}

const PatientQueueHeader: React.FC<PatientQueueHeaderProps> = ({ title, showLocationDropdown, actions }) => {
  const { t } = useTranslation();
  const { queueLocations, isLoading, error } = useQueueLocations();
  const { dashboardTitle } = useConfig<ConfigObject>();
  const userSession = useSession();
  const currentQueueLocationName = useSelectedQueueLocationName();
  const currentQueueLocationUuid = useSelectedQueueLocationUuid();

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
    if (!isLoading && !error && !currentQueueLocationUuid) {
      if (queueLocations.length === 1) {
        handleQueueLocationChange({ selectedItem: queueLocations[0] });
      }
      if (
        queueLocations.some((location) => location.id === userSession?.sessionLocation?.uuid) &&
        currentQueueLocationUuid
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
    currentQueueLocationName,
    currentQueueLocationUuid,
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
        {showLocationDropdown && (
          <Dropdown
            aria-label={t('selectQueueLocation', 'Select queue location')}
            className={styles.dropdown}
            id="queueLocationDropdown"
            label={currentQueueLocationName ?? t('all', 'All')}
            items={
              queueLocations.length !== 1 ? [{ id: 'all', name: t('all', 'All') }, ...queueLocations] : queueLocations
            }
            itemToString={(item) => (item ? item.name : '')}
            titleText={t('location', 'Location')}
            type="inline"
            onChange={handleQueueLocationChange}
          />
        )}
        {actions}
      </div>
    </PageHeader>
  );
};

export default PatientQueueHeader;
