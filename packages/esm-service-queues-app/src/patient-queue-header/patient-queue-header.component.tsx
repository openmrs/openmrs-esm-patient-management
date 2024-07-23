import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import { useSession, useConfig, PageHeaderContainer, PageHeader } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import PatientQueueIllustration from './patient-queue-illustration.component';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';

import {
  updateSelectedQueueLocationUuid,
  updateSelectedQueueLocationName,
  updateSelectedService,
  useSelectedQueueLocationName,
  useSelectedQueueLocationUuid,
} from '../helpers/helpers';
import styles from './patient-queue-header.scss';
interface PatientQueueHeaderProps {
  title?: string | JSX.Element;
  showLocationDropdown: boolean;
  actions?: React.ReactNode;
}

const PatientQueueHeader: React.FC<PatientQueueHeaderProps> = ({ title, showLocationDropdown, actions }) => {
  const { t } = useTranslation();
  const { queueLocations, isLoading, error } = useQueueLocations();
  const userSession = useSession();
  const currentQueueLocationName = useSelectedQueueLocationName();
  const currentQueueLocationUuid = useSelectedQueueLocationUuid();
  const { clinicName, showIllustration } = useConfig<ConfigObject>();

  const handleQueueLocationChange = useCallback(({ selectedItem }) => {
    if (selectedItem.id === 'all') {
      updateSelectedQueueLocationUuid(null);
      updateSelectedQueueLocationName(null);
    } else {
      updateSelectedQueueLocationUuid(selectedItem.id);
      updateSelectedQueueLocationName(selectedItem.name);
      updateSelectedService(null, t('all', 'All'));
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
    <PageHeaderContainer className={styles.header} data-testid="patient-queue-header">
      <PageHeader
        title={`${title}`}
        illustration={showIllustration ? <PatientQueueIllustration /> : null}
        clinicName={clinicName}
      />
      <div className={styles.dropdownContainer}>
        {showLocationDropdown && (
          <Dropdown
            aria-label="Select queue location"
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
    </PageHeaderContainer>
  );
};

export default PatientQueueHeader;
