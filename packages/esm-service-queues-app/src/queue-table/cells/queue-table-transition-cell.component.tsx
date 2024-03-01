import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export function QueueTableTransitionCell({ queueEntry }: QueueTableCellComponentProps) {
  const { t } = useTranslation();

  return (
    <div>
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

export const queueTableTransitionColumn: QueueTableColumn = {
  headerI18nKey: '',
  CellComponent: QueueTableTransitionCell,
  getFilterableValue: null,
};
