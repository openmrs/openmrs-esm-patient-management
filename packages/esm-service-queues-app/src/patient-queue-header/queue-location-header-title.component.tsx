import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineNotification } from '@carbon/react';
import { showModal, useConfig, useSession } from '@openmrs/esm-framework';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import { useSessionLocationAncestry } from '../hooks/useSessionLocationAncestry';
import {
  getValueFromSessionStorage,
  updateSelectedQueueLocationName,
  updateSelectedQueueLocationUuid,
  updateValueInSessionStorage,
  useServiceQueuesStore,
} from '../store/store';
import type { ConfigObject } from '../config-schema';
import styles from './queue-location-header-title.scss';

// Tracks which login location the current default was derived from, so a manual selection sticks
// and the default is only recomputed when the login location changes.
const LOGIN_LOCATION_STORAGE_KEY = 'queueLoginLocationUuid';

const QueueLocationHeaderTitle: React.FC = () => {
  const { t } = useTranslation();
  const { dashboardTitle } = useConfig<ConfigObject>();
  const { queueLocations, isLoading, error } = useQueueLocations();
  const userSession = useSession();
  const sessionLocationUuid = userSession?.sessionLocation?.uuid;
  const {
    ancestry,
    isLoading: isLoadingAncestry,
    error: ancestryError,
  } = useSessionLocationAncestry(sessionLocationUuid);
  const { selectedQueueLocationName, selectedServiceUuid, selectedServiceDisplay } = useServiceQueuesStore();

  // The login location if queue-tagged, else its nearest queue-tagged ancestor, else "All".
  const resolvedDefault = useMemo(() => {
    const location = ancestry
      .map((uuid) => queueLocations.find((queueLocation) => queueLocation.id === uuid))
      .find(Boolean);
    return { uuid: location?.id ?? null, name: location?.name ?? null };
  }, [ancestry, queueLocations]);

  useEffect(() => {
    // Skip while anything is still loading or a fetch failed: a degraded resolution must not persist
    // the "resolved" flag, otherwise the default stays stranded on "All" for the rest of the session.
    if (isLoading || isLoadingAncestry || error || ancestryError || !sessionLocationUuid) {
      return;
    }

    // Resolve the default only once per login location.
    if (getValueFromSessionStorage(LOGIN_LOCATION_STORAGE_KEY) === sessionLocationUuid) {
      return;
    }

    updateValueInSessionStorage(LOGIN_LOCATION_STORAGE_KEY, sessionLocationUuid);
    updateSelectedQueueLocationUuid(resolvedDefault.uuid);
    updateSelectedQueueLocationName(resolvedDefault.name);
  }, [
    isLoading,
    isLoadingAncestry,
    error,
    ancestryError,
    sessionLocationUuid,
    resolvedDefault.uuid,
    resolvedDefault.name,
  ]);

  const openChangeLocationModal = useCallback(() => {
    const dispose = showModal('change-queue-location-modal', {
      closeModal: () => dispose(),
    });
  }, []);

  if (error) {
    return (
      <InlineNotification kind="error" title={t('failedToLoadLocations', 'Failed to load locations')} hideCloseButton />
    );
  }

  const locationLabel = selectedQueueLocationName ?? t(dashboardTitle.key, dashboardTitle.value);
  const showService = Boolean(selectedQueueLocationName && selectedServiceUuid);

  return (
    <span className={styles.title}>
      <span className={styles.location}>{locationLabel}</span>
      {showService && <span className={styles.subLocation}>&middot; {selectedServiceDisplay}</span>}
      <Button className={styles.changeButton} kind="ghost" size="sm" onClick={openChangeLocationModal}>
        {t('change', 'Change')}
      </Button>
    </span>
  );
};

export default QueueLocationHeaderTitle;
