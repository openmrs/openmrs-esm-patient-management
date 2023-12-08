import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageQueue, ArrowRight } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { navigate, UserHasAccess } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';
import { SearchTypes } from '../types';
import PatientSearch from '../patient-search/patient-search.component';
import styles from './metrics-header.scss';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const metricsTitle = t('clinicMetrics', 'Clinic metrics');
  const queueScreenText = t('queueScreen', 'Queue screen');
  const [showOverlay, setShowOverlay] = useState(false);
  const [view, setView] = useState('');
  const [viewState, setViewState] = useState<{ selectedPatientUuid: string }>(null);
  const [overlayHeader, setOverlayTitle] = useState('');

  const navigateToQueueScreen = () => {
    navigate({ to: `${spaBasePath}/service-queues/screen` });
  };

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
      <div className={styles.actionBtn}>
        <UserHasAccess privilege="Emr: View Legacy Interface">
          <Button
            kind="tertiary"
            renderIcon={(props) => <ArrowRight size={16} {...props} />}
            onClick={(selectedPatientUuid) => {
              setShowOverlay(true);
              setView(SearchTypes.QUEUE_SERVICE_FORM);
              setViewState({ selectedPatientUuid });
              setOverlayTitle(t('addNewQueueService', 'Add new queue service'));
            }}
            iconDescription={t('addNewQueueService', 'Add new queue service')}>
            {t('addNewService', 'Add new service')}
          </Button>
          <Button
            kind="tertiary"
            renderIcon={(props) => <ArrowRight size={16} {...props} />}
            onClick={(selectedPatientUuid) => {
              setShowOverlay(true);
              setView(SearchTypes.QUEUE_ROOM_FORM);
              setViewState({ selectedPatientUuid });
              setOverlayTitle(t('addNewQueueServiceRoom', 'Add new queue service room'));
            }}
            iconDescription={t('addNewQueueServiceRoom', 'Add new queue service room')}>
            {t('addNewServiceRoom', 'Add new service room')}
          </Button>
        </UserHasAccess>
        <Button
          onClick={navigateToQueueScreen}
          kind="tertiary"
          renderIcon={(props) => <MessageQueue size={32} {...props} />}
          iconDescription={queueScreenText}>
          {queueScreenText}
        </Button>
      </div>
      {showOverlay && (
        <PatientSearch
          view={view}
          closePanel={() => setShowOverlay(false)}
          viewState={viewState}
          headerTitle={overlayHeader}
        />
      )}
    </div>
  );
};

export default MetricsHeader;
