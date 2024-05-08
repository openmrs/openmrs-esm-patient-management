import React, { useState } from 'react';
import { PatientBannerActionsMenu, showModal, useSession } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { MessageQueue, ArrowRight } from '@carbon/react/icons';
import { Button, ComboButton, MenuItem } from '@carbon/react';
import { navigate, UserHasAccess, useLayoutType } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';
import styles from './metrics-header.scss';
import Overlay from '../overlay.component';
import QueueRoomForm from '../queue-rooms/queue-room-form.component';
import QueueServiceForm from '../queue-services/queue-service-form.component';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const metricsTitle = t('clinicMetrics', 'Clinic metrics');
  const queueScreenText = t('queueScreen', 'Queue screen');
  const [showQueueServiceFormOverlay, setShowQueueServiceFormOverlay] = useState(false);
  const [showQueueRoomFormOverlay, setShowQueueRoomFormOverlay] = useState(false);
  const currentUserSession = useSession();
  const providerUuid = currentUserSession?.currentProvider?.uuid;

  const navigateToQueueScreen = () => {
    navigate({ to: `${spaBasePath}/service-queues/screen` });
  };
  const closeOverlays = () => {
    setShowQueueServiceFormOverlay(false);
    setShowQueueRoomFormOverlay(false);
  };
  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
      <ComboButton
        label={queueScreenText}
        menuAlignment="bottom-end"
        className={styles.comboBtn}
        tooltipAlignment="top-right"
        onClick={navigateToQueueScreen}>
        <UserHasAccess privilege="Emr: View Legacy Interface">
          <MenuItem
            label={t('addNewService', 'Add new service')}
            onClick={() => setShowQueueServiceFormOverlay(true)}
          />
          <MenuItem
            label={t('addNewServiceRoom', 'Add new service room')}
            onClick={() => setShowQueueRoomFormOverlay(true)}
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
      {showQueueServiceFormOverlay && (
        <Overlay header={t('addNewQueueService', 'Add new queue service')} closePanel={closeOverlays}>
          <QueueServiceForm closePanel={closeOverlays} />
        </Overlay>
      )}
      {showQueueRoomFormOverlay && (
        <Overlay header={t('addNewQueueServiceRoom', 'Add new queue service room')} closePanel={closeOverlays}>
          <QueueRoomForm closePanel={closeOverlays} />
        </Overlay>
      )}
    </div>
  );
};

export default MetricsHeader;
