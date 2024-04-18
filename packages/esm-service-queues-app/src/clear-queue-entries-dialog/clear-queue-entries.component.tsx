import { Button } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueEntry } from '../types';
import styles from './clear-queue-entries-dialog.scss';

interface ClearQueueEntriesProps {
  queueEntries: Array<QueueEntry>;
}

/**
 * Button to nd queue entries of all patients in a queue table and end their visits.
 * Slated for removal once we have a better way to end queue entries.
 * @param param0
 * @returns
 * @deprecated
 */
const ClearQueueEntries: React.FC<ClearQueueEntriesProps> = ({ queueEntries }) => {
  const { t } = useTranslation();

  const launchClearAllQueueEntriesModal = useCallback(() => {
    const dispose = showModal('clear-all-queue-entries', {
      closeModal: () => dispose(),
      queueEntries,
    });
  }, [queueEntries]);

  return (
    <Button
      size="sm"
      kind="danger--tertiary"
      className={styles.clearBtn}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
      onClick={launchClearAllQueueEntriesModal}
      iconDescription={t('clearQueue', 'Clear queue')}>
      {t('clearQueue', 'Clear queue')}
    </Button>
  );
};

export default ClearQueueEntries;
