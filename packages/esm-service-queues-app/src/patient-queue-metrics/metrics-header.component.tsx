import React, { useState } from 'react';
import { PatientBannerActionsMenu } from '@openmrs/esm-framework';
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
  const isTablet = useLayoutType() === 'tablet';
  const isPhone = useLayoutType() == 'phone';
  const metricsTitle = t('clinicMetrics', 'Clinic metrics');
  const queueScreenText = t('queueScreen', 'Queue screen');
  const [showQueueServiceFormOverlay, setShowQueueServiceFormOverlay] = useState(false);
  const [showQueueRoomFormOverlay, setShowQueueRoomFormOverlay] = useState(false);

  const navigateToQueueScreen = () => {
    navigate({ to: `${spaBasePath}/service-queues/screen` });
  };
  const closeOverlays = () => {
    setShowQueueServiceFormOverlay(false);
    setShowQueueRoomFormOverlay(false);
  };
  if (isTablet || isPhone) {
    return (
      <div className={styles.metricsContainer}>
        <span className={styles.metricsTitle}>{metricsTitle}</span>
        <UserHasAccess privilege="Emr: View Legacy Interface">
          <ComboButton label={t('actions', 'Actions')} menuAlignment="bottom-end" className={styles.comboBtn}>
            <MenuItem
              label={t('addNewService', 'Add new service')}
              onClick={() => setShowQueueServiceFormOverlay(true)}
            />

            <MenuItem
              label={t('addNewServiceRoom', 'Add new service room')}
              onClick={() => setShowQueueRoomFormOverlay(true)}
            />
            <MenuItem label={queueScreenText} onClick={navigateToQueueScreen} />
          </ComboButton>
        </UserHasAccess>
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
  }
  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
      <div className={styles.actionBtn}>
        <UserHasAccess privilege="Emr: View Legacy Interface">
          <Button
            kind="tertiary"
            renderIcon={(props) => <ArrowRight size={16} {...props} />}
            onClick={() => setShowQueueServiceFormOverlay(true)}
            iconDescription={t('addNewQueueService', 'Add new queue service')}>
            {t('addNewService', 'Add new service')}
          </Button>
          <Button
            kind="tertiary"
            renderIcon={(props) => <ArrowRight size={16} {...props} />}
            onClick={() => setShowQueueRoomFormOverlay(true)}
            iconDescription={t('addNewQueueServiceRoom', 'Add new queue service room')}>
            {t('addNewServiceRoom', 'Add new service room')}
          </Button>
        </UserHasAccess>
        <Button
          onClick={navigateToQueueScreen}
          kind="tertiary"
          renderIcon={(props) => <MessageQueue size={16} {...props} />}
          iconDescription={queueScreenText}>
          {queueScreenText}
        </Button>
      </div>
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
