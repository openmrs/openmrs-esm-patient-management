import { ComboButton, MenuItem } from '@carbon/react';
import { UserHasAccess, isDesktop, launchWorkspace, navigate, showModal, useLayoutType, useSession } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { spaBasePath } from '../constants';
import styles from './metrics-header.scss';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const metricsTitle = t('clinicMetrics', 'Clinic metrics');
  const queueScreenText = t('queueScreen', 'Queue screen');
  const [showQueueRoomFormOverlay, setShowQueueRoomFormOverlay] = useState(false);
  const currentUserSession = useSession();
  const providerUuid = currentUserSession?.currentProvider?.uuid;
  const layout = useLayoutType();

  const navigateToQueueScreen = () => {
    navigate({ to: `${spaBasePath}/service-queues/screen` });
  };
  const closeOverlays = () => {
    setShowQueueRoomFormOverlay(false);
  };
  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
      <ComboButton
        label={queueScreenText}
        size={isDesktop(layout) ? 'sm' : 'lg'}
        menuAlignment="bottom-end"
        className={styles.comboBtn}
        tooltipAlignment="top-right"
        onClick={navigateToQueueScreen}>
        <UserHasAccess privilege="Emr: View Legacy Interface">
          <MenuItem
            label={t('addNewService', 'Add new service')}
            onClick={() => launchWorkspace("service-queues-service-form")}
          />
          <MenuItem
            label={t('addNewServiceRoom', 'Add new service room')}
            onClick={() => launchWorkspace("service-queues-service-room-form")}
          />
        </UserHasAccess>
        <MenuItem
          label={t('addProviderQueueRoom', 'Add provider queue room')}
          onClick={() => {
            const dispose = showModal('add-provider-to-room-modal', {
              closeModal: () => dispose(),
              providerUuid,
            });
          }}
        />
      </ComboButton>
    </div>
  );
};

export default MetricsHeader;
