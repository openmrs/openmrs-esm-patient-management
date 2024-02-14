import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export function QueueTableActionsCell({ queueEntry }: QueueTableCellComponentProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Button
        kind="ghost"
        aria-label="Actions"
        onClick={() => {
          const dispose = showModal('transfer-queue-entry', {
            closeModal: () => dispose(),
            queueEntry,
          });
        }}>
        {t('transfer', 'Transfer')}
      </Button>
      <OverflowMenu aria-label="Actions" iconDescription={t('actions', 'Actions')} size="sm" flipped>
        <OverflowMenuItem
          itemText={t('transitionStatus', 'Transition status')}
          onClick={() => {
            const dispose = showModal('transition-queue-entry-status-dialog', {
              closeModal: () => dispose(),
              queueEntry,
            });
          }}
        />
        <OverflowMenuItem
          itemText={t('transitionPriority', 'Transition priority')}
          onClick={() => {
            const dispose = showModal('transition-queue-entry-priority-dialog', {
              closeModal: () => dispose(),
              queueEntry,
            });
          }}
        />
      </OverflowMenu>
    </div>
  );
}

export const queueTableActionsColumn: QueueTableColumn = {
  headerI18nKey: '',
  CellComponent: QueueTableActionsCell,
};
