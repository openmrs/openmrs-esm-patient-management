import React, { useCallback } from 'react';
import { showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { MappedVisitQueueEntry } from '../active-visits/active-visits-table.resource';
import { Button } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';

interface ClearQueueEntriesProps {
  visitQueueEntries: Array<MappedVisitQueueEntry>;
}

const ClearQueueEntries: React.FC<ClearQueueEntriesProps> = ({ visitQueueEntries }) => {
  const { t } = useTranslation();

  const launchClearAllQueueEntriesModal = useCallback(() => {
    const dispose = showModal('clear-all-queue-entries', {
      closeModal: () => dispose(),
      visitQueueEntries,
    });
  }, [visitQueueEntries]);

  return (
    <Button
      size="sm"
      kind="danger"
      renderIcon={(props) => <TrashCan size={16} {...props} />}
      onClick={launchClearAllQueueEntriesModal}
      iconDescription={t('clearQueue', 'Clear queue')}>
      {t('clearQueue', 'Clear queue')}
    </Button>
  );
};

export default ClearQueueEntries;
