import { Button } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export function QueueTableActionCell({ queueEntry }: QueueTableCellComponentProps) {
  const { t } = useTranslation();

  return (
    <div>
      {queueEntry.previousQueueEntry == null ? (
        <Button
          kind="ghost"
          aria-label={t('actions', 'Actions')}
          onClick={() => {
            const dispose = showModal('void-queue-entry-modal', {
              closeModal: () => dispose(),
              queueEntry,
            });
          }}>
          {t('delete', 'Delete')}
        </Button>
      ) : (
        <Button
          kind="ghost"
          aria-label={t('actions', 'Actions')}
          onClick={() => {
            const dispose = showModal('undo-transition-queue-entry-modal', {
              closeModal: () => dispose(),
              queueEntry,
            });
          }}>
          {t('undoTransition', 'Undo transition')}
        </Button>
      )}
      <Button
        kind="ghost"
        aria-label={t('actions', 'Actions')}
        onClick={() => {
          const dispose = showModal('edit-queue-entry-modal', {
            closeModal: () => dispose(),
            queueEntry,
          });
        }}>
        {t('edit', 'Edit')}
      </Button>
      <Button
        kind="ghost"
        aria-label={t('actions', 'Actions')}
        onClick={() => {
          const dispose = showModal('transition-queue-entry-modal', {
            closeModal: () => dispose(),
            queueEntry,
          });
        }}>
        {t('transition', 'Transition')}
      </Button>
    </div>
  );
}

export const queueTableActionColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('actions', 'Actions');
  },
  key: 'actions',
  CellComponent: QueueTableActionCell,
  getFilterableValue: null,
};
