import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboButton, MenuItem } from '@carbon/react';
import {
  UserHasAccess,
  isDesktop,
  launchWorkspace,
  navigate,
  showModal,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';
import styles from './metrics-header.scss';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const currentUserSession = useSession();
  const layout = useLayoutType();

  const metricsTitle = t('clinicMetrics', 'Clinic metrics');
  const queueScreenText = t('queueScreen', 'Queue screen');
  const providerUuid = currentUserSession?.currentProvider?.uuid;

  const launchAddProviderToRoomModal = useCallback(() => {
    const dispose = showModal('add-provider-to-room-modal', {
      closeModal: () => dispose(),
      providerUuid,
    });
  }, [providerUuid]);

  const navigateToQueueScreen = useCallback(() => {
    navigate({ to: `${spaBasePath}/service-queues/screen` });
  }, []);

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
      <ComboButton
        className={styles.comboBtn}
        label={queueScreenText}
        menuAlignment="bottom-end"
        onClick={navigateToQueueScreen}
        size={isDesktop(layout) ? 'sm' : 'lg'}
        tooltipAlignment="top-end">
        <UserHasAccess privilege="Emr: View Legacy Interface">
          <MenuItem
            label={t('addNewService', 'Add new service')}
            onClick={() => launchWorkspace('service-queues-service-form')}
          />
          <MenuItem
            label={t('addNewServiceRoom', 'Add new service room')}
            onClick={() => launchWorkspace('service-queues-room-form')}
          />
        </UserHasAccess>
        <MenuItem label={t('addProviderQueueRoom', 'Add provider queue room')} onClick={launchAddProviderToRoomModal} />
      </ComboButton>
    </div>
  );
};

export default MetricsHeader;
