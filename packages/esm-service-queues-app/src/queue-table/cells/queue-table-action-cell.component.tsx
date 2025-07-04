import React from 'react';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { isDesktop, showModal, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps, type QueueEntry } from '../../types';
import styles from './queue-table-action-cell.scss';
import { type ActionsColumnConfig } from '../../config-schema';

// Map action strings to component props
const ActionProps = {
  call: {
    // t('call', 'Call'),
    label: 'call',
    text: 'Call',
    onClick: (queueEntry: QueueEntry) => {
      const dispose = showModal('call-queue-entry-modal', {
        closeModal: () => dispose(),
        queueEntry,
      });
    },
  },
  move: {
    // t('move', 'Move'),
    label: 'move',
    text: 'Move',
    onClick: (queueEntry: QueueEntry) => {
      const dispose = showModal('move-queue-entry-modal', {
        closeModal: () => dispose(),
        queueEntry,
      });
    },
  },
  edit: {
    // t('edit', 'Edit'),
    label: 'edit',
    text: 'Edit',
    onClick: (queueEntry: QueueEntry) => {
      const dispose = showModal('edit-queue-entry-modal', {
        closeModal: () => dispose(),
        queueEntry,
      });
    },
  },
  remove: {
    // t('removePatient', 'Remove patient'),
    label: 'removePatient',
    text: 'Remove patient',
    onClick: (queueEntry: QueueEntry) => {
      const dispose = showModal('end-queue-entry-modal', {
        closeModal: () => dispose(),
        queueEntry,
        size: 'sm',
      });
    },
  },
  delete: {
    // t('deleteEntry', 'Delete entry'),
    label: 'deleteEntry',
    text: 'Delete entry',
    onClick: (queueEntry: QueueEntry) => {
      const dispose = showModal('void-queue-entry-modal', {
        closeModal: () => dispose(),
        queueEntry,
        size: 'sm',
      });
    },
    isDelete: true,
    showIf: (queueEntry: QueueEntry) => {
      return queueEntry.previousQueueEntry === null;
    },
  },
  undo: {
    // t('undoTransition', 'Undo transition'),
    label: 'undoTransition',
    text: 'Undo transition',
    onClick: (queueEntry: QueueEntry) => {
      const dispose = showModal('undo-transition-queue-entry-modal', {
        closeModal: () => dispose(),
        queueEntry,
        size: 'sm',
      });
    },
    isDelete: true,
    showIf: (queueEntry: QueueEntry) => {
      return queueEntry.previousQueueEntry !== null;
    },
  },
};

function ActionButton({ actionKey, queueEntry }: { actionKey: string; queueEntry: QueueEntry }) {
  const { t } = useTranslation();
  const layout = useLayoutType();

  const actionProps = ActionProps[actionKey];
  if (!actionProps) {
    console.error(`Service queue table configuration uses unknown action in 'action.buttons': ${actionKey}`);
    return null;
  }

  if (actionProps.showIf && !actionProps.showIf(queueEntry)) {
    return null;
  }

  return (
    <Button
      key={actionKey}
      kind="ghost"
      aria-label={t(actionProps.label, actionProps.text)}
      onClick={() => actionProps.onClick(queueEntry)}
      size={isDesktop(layout) ? 'sm' : 'lg'}>
      {t(actionProps.label, actionProps.text)}
    </Button>
  );
}

function ActionOverflowMenuItem({ actionKey, queueEntry }: { actionKey: string; queueEntry: QueueEntry }) {
  const { t } = useTranslation();
  const actionProps = ActionProps[actionKey];
  if (!actionProps) {
    console.error(`Service queue table configuration uses unknown action in 'action.overflowMenu': ${actionKey}`);
    return null;
  }

  if (actionProps.showIf && !actionProps.showIf(queueEntry)) {
    return null;
  }

  return (
    <OverflowMenuItem
      key={actionKey}
      className={styles.menuItem}
      aria-label={t(actionProps.label, actionProps.text)}
      hasDivider
      isDelete={actionProps.isDelete}
      onClick={() => actionProps.onClick(queueEntry)}
      itemText={t(actionProps.label, actionProps.text)}
    />
  );
}

export const queueTableActionColumn: QueueTableColumnFunction = (key, header, config: ActionsColumnConfig) => {
  const { buttons, overflowMenu } = config.actions;

  const QueueTableActionCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    const layout = useLayoutType();

    return (
      <div className={styles.actionsCell}>
        {buttons.map((actionKey) => (
          <ActionButton key={actionKey} actionKey={actionKey} queueEntry={queueEntry} />
        ))}

        <OverflowMenu aria-label="Actions menu" size={isDesktop(layout) ? 'sm' : 'lg'} align="left" flipped>
          {overflowMenu.map((actionKey) => (
            <ActionOverflowMenuItem key={actionKey} actionKey={actionKey} queueEntry={queueEntry} />
          ))}
        </OverflowMenu>
      </div>
    );
  };

  return {
    key,
    header,
    CellComponent: QueueTableActionCell,
    getFilterableValue: null,
  };
};
