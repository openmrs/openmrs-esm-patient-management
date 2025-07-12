import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { isDesktop, showModal, useLayoutType } from '@openmrs/esm-framework';
import { type QueueEntry } from '../../types';
import styles from './clear-queue-entries.scss';

interface ClearQueueEntriesProps {
  queueEntries: Array<QueueEntry>;
}

/**
 * Button to end queue entries of all patients in a queue table and end their visits.
 * TODO: Remove this button once we have a better way to end queue entries.
 * @param param0
 * @returns
 * @deprecated
 */
const ClearQueueEntries: React.FC<ClearQueueEntriesProps> = ({ queueEntries }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  const launchClearAllQueueEntriesModal = useCallback(() => {
    const dispose = showModal('clear-all-queue-entries-modal', {
      closeModal: () => dispose(),
      queueEntries,
    });
  }, [queueEntries]);

  return (
    <Button
      className={styles.clearQueueButton}
      size={isDesktop(layout) ? 'sm' : 'lg'}
      kind="ghost"
      onClick={launchClearAllQueueEntriesModal}
      iconDescription={t('clearQueue', 'Clear queue')}>
      {t('clearQueue', 'Clear queue')}
    </Button>
  );
};

export default ClearQueueEntries;
