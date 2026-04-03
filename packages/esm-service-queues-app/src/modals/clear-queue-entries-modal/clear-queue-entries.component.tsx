import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { isDesktop, showModal, useLayoutType } from '@openmrs/esm-framework';
import { type QueueEntry } from '../../types';
import styles from './clear-queue-entries.scss';

interface ClearQueueEntriesProps {
  queueEntries: Array<QueueEntry>;
}

/** Button to end all queue entries in a queue table. */
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
      iconDescription={t('clearQueueEntries', 'Clear queue entries')}>
      {t('clearQueueEntries', 'Clear queue entries')}
    </Button>
  );
};

export default ClearQueueEntries;
