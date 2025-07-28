import React from 'react';
import { Tag, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { isDesktop, showModal, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useQueueEntries } from '../hooks/useQueueEntries';
import styles from './patient-banner-queue-entry-status.scss';

interface PatientBannerQueueEntryStatusProps {
  patientUuid: string;
  renderedFrom: string;
}

const PatientBannerQueueEntryStatus: React.FC<PatientBannerQueueEntryStatusProps> = ({ patientUuid, renderedFrom }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { queueEntries } = useQueueEntries({ patient: patientUuid, isEnded: false });
  const queueEntry = queueEntries?.[0];
  const config = useConfig();

  const isPatientChart = renderedFrom === 'patient-chart';
  if (!isPatientChart || !queueEntry) {
    return null;
  }

  const priorityUuid = queueEntry?.priority?.uuid;
  const priorityDisplay = queueEntry?.priority?.display;
  const priorityConfig = config?.priorityConfigs?.find((p: any) => p.conceptUuid === priorityUuid);
  const tagColor = priorityConfig?.color || 'gray';
  const tagStyle = priorityConfig?.style;

  return (
    <div className={styles.queueEntryStatusContainer}>
      <span className={styles.separator}>&middot;</span>
      <span>{queueEntry.queue.name}</span>
      <Tag className={tagStyle === 'bold' ? styles.priorityTag : styles.tag} type={tagColor}>
        {priorityDisplay}
      </Tag>
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
};

export default PatientBannerQueueEntryStatus;
