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
          aria-label="Actions"
          onClick={() => {
            const dispose = showModal('void-queue-entry-modal', {
              closeModal: () => dispose(),
              queueEntry,
            });
          }}>
          {t('void', 'Void')}
        </Button>
      ) : (
        <Button
          kind="ghost"
          aria-label="Actions"
          onClick={() => {
            const dispose = showModal('undo-transition-queue-entry-modal', {
              closeModal: () => dispose(),
              queueEntry,
            });
          }}>
          {t('moveBack', 'Move Back')}
        </Button>
      )}
      <Button
        kind="ghost"
        aria-label="Actions"
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
        aria-label="Actions"
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
  headerI18nKey: '',
  CellComponent: QueueTableActionCell,
  getFilterableValue: null,
};
