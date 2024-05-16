import { Button } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import { isDesktop, showModal, useLayoutType } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueEntry } from '../types';
import styles from './clear-queue-entries-dialog.scss';

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
    const dispose = showModal('clear-all-queue-entries', {
      closeModal: () => dispose(),
      queueEntries,
    });
  }, [queueEntries]);

  return (
    <Button
      size={isDesktop(layout) ? 'sm' : 'lg'}
      kind="danger--tertiary"
      renderIcon={(props) => <TrashCan size={16} {...props} />}
      onClick={launchClearAllQueueEntriesModal}
      iconDescription={t('clearQueue', 'Clear queue')}>
      {t('clearQueue', 'Clear queue')}
    </Button>
  );
};

export default ClearQueueEntries;
