import React, { useMemo } from 'react';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { isDesktop, showModal, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps, type QueueEntry } from '../../types';
import styles from './queue-table-action-cell.scss';
import { type ConfigObject, type ActionsColumnConfig } from '../../config-schema';

type ActionProps = {
  label: string;
  text: string;
  onClick: (queueEntry: QueueEntry) => void;
  showIf?: (queueEntry: QueueEntry) => boolean;
  isDelete?: boolean;
};

function useActionPropsByKey() {
  const { defaultStatusConceptUuid } = useConfig<ConfigObject>().concepts;

  // Map action strings to component props
  const actionPropsByKey: Record<string, ActionProps> = useMemo(() => {
    return {
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
        showIf: (queueEntry: QueueEntry) => {
          return queueEntry.status.uuid === defaultStatusConceptUuid;
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
  }, [defaultStatusConceptUuid]);
  return actionPropsByKey;
}

function ActionButton({ actionKey, queueEntry }: { actionKey: string; queueEntry: QueueEntry }) {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const actionPropsByKey = useActionPropsByKey();

  const actionProps = actionPropsByKey[actionKey];
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
  const actionPropsByKey = useActionPropsByKey();

  const actionProps = actionPropsByKey[actionKey];
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
  const QueueTableActionCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    const layout = useLayoutType();
    const actionPropsByKey = useActionPropsByKey();
    const { buttons, overflowMenu } = config.actions;

    const [buttonComponents, overflowMenuComponents] = useMemo(() => {
      const declaredButtonComponents = buttons
        .map((actionKey) => {
          const actionProps = actionPropsByKey[actionKey];
          if (!actionProps) {
            console.error(
              `Service queue table configuration uses unknown action in 'action.overflowMenu': ${actionKey}`,
            );
            return null;
          }

          if (actionProps.showIf && !actionProps.showIf(queueEntry)) {
            return null;
          }
          return <ActionButton key={actionKey} actionKey={actionKey} queueEntry={queueEntry} />;
        })
        .filter(Boolean);
      let fallbackActionComponent: React.ReactNode | null = null;
      let overflowMenuKeys: string[] = [];
      if (declaredButtonComponents.length === 0) {
        const defaultAction = overflowMenu.find((actionKey) => {
          const showIf = actionPropsByKey[actionKey].showIf;
          if (!showIf) {
            return true;
          }
          return showIf(queueEntry);
        });
        if (defaultAction) {
          fallbackActionComponent = (
            <ActionButton key={defaultAction} actionKey={defaultAction} queueEntry={queueEntry} />
          );
          overflowMenuKeys = overflowMenu.filter((actionKey) => actionKey !== defaultAction);
        } else {
          overflowMenuKeys = overflowMenu;
        }
      } else {
        overflowMenuKeys = overflowMenu;
      }

      const overflowMenuComponents = overflowMenuKeys.map((actionKey) => (
        <ActionOverflowMenuItem key={actionKey} actionKey={actionKey} queueEntry={queueEntry} />
      ));

      return [[...declaredButtonComponents, fallbackActionComponent], overflowMenuComponents];
    }, [buttons, overflowMenu, queueEntry, actionPropsByKey]);

    return (
      <div className={styles.actionsCell}>
        {buttonComponents}

        <OverflowMenu aria-label="Actions menu" size={isDesktop(layout) ? 'sm' : 'lg'} align="left" flipped>
          {overflowMenuComponents}
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
