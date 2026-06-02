import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { type ConfigObject, isDesktop, showModal, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useQueueEntries } from '../hooks/useQueueEntries';
import QueuePriority from '../queue-table/components/queue-priority.component';
import styles from './patient-banner-queue-entry-status.scss';

interface PatientBannerQueueEntryStatusProps {
  patientUuid: string;
  renderedFrom: string;
}

const PatientBannerQueueEntryStatus: React.FC<PatientBannerQueueEntryStatusProps> = ({ patientUuid, renderedFrom }) => {
  const isPatientChart = renderedFrom === 'patient-chart';

  if (!isPatientChart) {
    return null;
  }

  return <PatientBannerQueueEntryStatusInner patientUuid={patientUuid} />;
};

const PatientBannerQueueEntryStatusInner: React.FC<Pick<PatientBannerQueueEntryStatusProps, 'patientUuid'>> =
  React.memo(({ patientUuid }) => {
    const { t } = useTranslation();
    const layout = useLayoutType();
    const { queueEntries } = useQueueEntries(
      { patient: patientUuid, isEnded: false },
      'custom:(uuid,display,priority,priorityComment,queue)',
    );

    const queueEntry = queueEntries?.[0];
    const config = useConfig<ConfigObject>();

    if (!queueEntry) {
      return null;
    }

    return (
      <div className={styles.queueEntryStatusContainer}>
        <span>{queueEntry.queue.name}</span>
        <QueuePriority
          priority={queueEntry.priority}
          priorityComment={queueEntry.priorityComment}
          priorityConfigs={config?.priorityConfigs}
        />
        <Button
          kind="ghost"
          size={isDesktop(layout) ? 'sm' : 'lg'}
          onClick={() => {
            const dispose = showModal('move-queue-entry-modal', {
              closeModal: () => dispose(),
              queueEntry,
            });
          }}>
          {t('move', 'Move')}
        </Button>
      </div>
    );
  });
PatientBannerQueueEntryStatusInner.displayName = 'PatientBannerQueueEntryStatusInner';

export default PatientBannerQueueEntryStatus;
