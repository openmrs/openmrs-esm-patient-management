import React, { useCallback } from 'react';
import { navigate, showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { MappedVisitQueueEntry } from '../active-visits/active-visits-table.resource';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import styles from './actions-menu.scss';

interface ActionsMenuProps {
  queueEntry: MappedVisitQueueEntry;
  closeModal: () => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const launchEndVisitModal = useCallback(() => {
    const dispose = showModal('remove-queue-entry', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Layer>
      <OverflowMenu ariaLabel="Actions menu" selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#editPatientDetails"
          itemText={t('editPatientDetails', 'Edit patient details')}
          onClick={() =>
            navigate({
              to: `\${openmrsSpaBase}/patient/${queueEntry.patientUuid}/edit`,
            })
          }>
          {t('editPatientDetails', 'Edit patient details')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#endVisit"
          onClick={launchEndVisitModal}
          hasDivider
          isDelete
          itemText={t('endVisit', 'End visit')}>
          {t('endVisit', 'End Visit')}
        </OverflowMenuItem>
      </OverflowMenu>
    </Layer>
  );
};

export default ActionsMenu;
