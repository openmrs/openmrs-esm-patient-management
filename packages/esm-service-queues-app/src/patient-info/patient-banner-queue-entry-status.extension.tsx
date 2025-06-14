import { Tag, Button } from '@carbon/react';
import React from 'react';
import { useQueueEntries } from '../hooks/useQueueEntries';
import styles from './patient-banner-queue-entry-status.scss';
import { useTranslation } from 'react-i18next';
import { isDesktop, showModal, useLayoutType } from '@openmrs/esm-framework';

// See: patient-banner-patient-info.component.tsx
interface PatientBannerQueueEntryStatusProps {
  patientUuid: string;
  renderedFrom: string;
}

/**
 * This extension appears in the patient banner to indicate the patient's
 * queue entry status, with a quick link to transition them to q new queue / status
 */
const PatientBannerQueueEntryStatus: React.FC<PatientBannerQueueEntryStatusProps> = ({ patientUuid, renderedFrom }) => {
  const { queueEntries } = useQueueEntries({ patient: patientUuid, isEnded: false });
  const layout = useLayoutType();
  const queueEntry = queueEntries?.[0];
  const { t } = useTranslation();
  const isPatientChart = renderedFrom === 'patient-chart';
  if (!isPatientChart || !queueEntry) {
    return <></>;
  }

  const mappedPriority = queueEntry.priority.display === 'Urgent' ? 'Priority' : queueEntry.priority.display;

  return (
    <div className={styles.queueEntryStatusContainer}>
      <span className={styles.separator}>&middot;</span>
      <span>{queueEntry.queue.name}</span>
      <Tag
        className={mappedPriority === 'Priority' ? styles.priorityTag : styles.tag}
        type={getTagType(mappedPriority?.toLocaleLowerCase('en'))}>
        {mappedPriority}
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

// The color of the priority tag should not be hard coded, see:
// https://openmrs.atlassian.net/browse/O3-4469
const getTagType = (priority: string) => {
  switch (priority) {
    case 'emergency':
      return 'red';
    case 'not urgent':
      return 'green';
    default:
      return 'gray';
  }
};

export default PatientBannerQueueEntryStatus;
