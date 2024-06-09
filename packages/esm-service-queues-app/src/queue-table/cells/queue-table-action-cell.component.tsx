import React from 'react';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';
import styles from './queue-table-action-cell.scss';

export function QueueTableActionCell({ queueEntry }: QueueTableCellComponentProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.actionCellContainer}>
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
      <OverflowMenu aria-label="Actions menu" size="sm" flipped>
        <OverflowMenuItem
          className={styles.menuItem}
          aria-label={t('edit', 'Edit')}
          hasDivider
          onClick={() => {
            const dispose = showModal('edit-queue-entry-modal', {
              closeModal: () => dispose(),
              queueEntry,
            });
          }}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          aria-label={t('removePatient', 'Remove patient')}
          hasDivider
          onClick={() => {
            const dispose = showModal('end-queue-entry-modal', {
              closeModal: () => dispose(),
              queueEntry,
            });
          }}
          itemText={t('removePatient', 'Remove patient')}
        />
        {queueEntry.previousQueueEntry == null ? (
          <OverflowMenuItem
            className={styles.menuItem}
            aria-label={t('delete', 'Delete')}
            hasDivider
            isDelete
            onClick={() => {
              const dispose = showModal('void-queue-entry-modal', {
                closeModal: () => dispose(),
                queueEntry,
              });
            }}
            itemText={t('delete', 'Delete')}
          />
        ) : (
          <OverflowMenuItem
            className={styles.menuItem}
            aria-label={t('undoTransition', 'Undo transition')}
            hasDivider
            isDelete
            onClick={() => {
              const dispose = showModal('undo-transition-queue-entry-modal', {
                closeModal: () => dispose(),
                queueEntry,
              });
            }}
            itemText={t('undoTransition', 'Undo transition')}
          />
        )}
      </OverflowMenu>
    </div>
  );
}

export const queueTableActionColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTableActionCell,
  getFilterableValue: null,
});
