import { Tag, Button } from '@carbon/react';
import React from 'react';
import { useQueueEntries } from '../hooks/useQueueEntries';
import styles from './patient-banner-queue-entry-status.scss';
import { useTranslation } from 'react-i18next';
import { isDesktop, showModal, useLayoutType } from '@openmrs/esm-framework';
import { defaultPriorityConfig } from '../config-schema';

interface PatientBannerQueueEntryStatusProps {
  patientUuid: string;
  renderedFrom: string;
}

/**
 * This extension appears in the patient banner to indicate the patient's
 *  queue entry status, with a quick link to transition them to q new queue / status
 */
const PatientBannerQueueEntryStatus: React.FC<PatientBannerQueueEntryStatusProps> = ({ patientUuid, renderedFrom }) => {
  const { queueEntries } = useQueueEntries({ patient: patientUuid, isEnded: false });
  const layout = useLayoutType();
  const queueEntry = queueEntries?.[0];
  const { t } = useTranslation();
  const isPatientChart = renderedFrom === 'patient-chart';

  if (!isPatientChart || !queueEntry) {
    return null;
  }

  const priorityDisplay = queueEntry.priority.display;
  const tagColor = getTagColor(queueEntry.priority.uuid);

  return (
    <div className={styles.queueEntryStatusContainer}>
      <span className={styles.separator}>&middot;</span>
      <span>{queueEntry.queue.name}</span>
      <Tag className={tagColor === 'red' ? styles.priorityTag : styles.tag} type={tagColor}>
        {priorityDisplay}
      </Tag>
      <Button
        kind="ghost"
        size={isDesktop(layout) ? 'sm' : 'lg'}
        onClick={() => {
          const dispose = showModal('transition-queue-entry-modal', {
            closeModal: () => dispose(),
            queueEntry,
          });
        }}>
        {t('change', 'Change')}
      </Button>
    </div>
  );
};

const getTagColor = (priorityUuid: string): string => {
  const config = defaultPriorityConfig.find((item) => item.conceptUuid.toLowerCase() === priorityUuid.toLowerCase());
  return config?.color ?? 'gray';
};

export default PatientBannerQueueEntryStatus;
