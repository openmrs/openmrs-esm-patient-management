import React, { useMemo, useRef, useState } from 'react';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { isDesktop, showModal, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps, type QueueEntry } from '../../types';
import { type ConfigObject, type ActionsColumnConfig, type QueueEntryAction } from '../../config-schema';
import { mapVisitQueueEntryProperties, serveQueueEntry } from '../../service-queues.resource';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import styles from './queue-table-action-cell.scss';

type ActionProps = {
  label: string;
  text: string;
  onClick: (queueEntry: QueueEntry) => void;
  showIf?: (queueEntry: QueueEntry) => boolean;
  isDelete?: boolean;
};

function useActionPropsByKey() {
  const {
    concepts: { defaultStatusConceptUuid },
    visitQueueNumberAttributeUuid,
  } = useConfig<ConfigObject>();
  const { mutateQueueEntries } = useMutateQueueEntries();

  // Map action strings to component props
  const actionPropsByKey: Record<QueueEntryAction, ActionProps> = useMemo(() => {
    return {
      call: {
        // t('call', 'Call'),
        label: 'call',
        text: 'Call',
        onClick: async (queueEntry: QueueEntry) => {
          const mappedQueueEntry = mapVisitQueueEntryProperties(queueEntry, visitQueueNumberAttributeUuid);
          const callingQueueResponse = await serveQueueEntry(
            mappedQueueEntry.queue.name,
            mappedQueueEntry.visitQueueNumber,
            'calling',
          );
          if (callingQueueResponse.ok) {
            await mutateQueueEntries();
            const dispose = showModal('call-queue-entry-modal', {
              closeModal: () => dispose(),
              queueEntry,
              size: 'sm',
            });
          }
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
            size: 'sm',
          });
        },
      },
      transition: {
        // t('transition', 'Transition'),
        label: 'transition',
        text: 'Transition',
        onClick: (queueEntry: QueueEntry) => {
          const dispose = showModal('transition-queue-entry-modal', {
            closeModal: () => dispose(),
            queueEntry,
            size: 'sm',
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
            size: 'sm',
          });
        },
      },
      remove: {
        // t('removePatient', 'Remove patient'),
        label: 'removePatient',
        text: 'Remove patient',
        onClick: (queueEntry: QueueEntry) => {
          const dispose = showModal('remove-queue-entry-modal', {
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
          const dispose = showModal('delete-queue-entry-modal', {
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
  }, [defaultStatusConceptUuid, visitQueueNumberAttributeUuid, mutateQueueEntries]);
  return actionPropsByKey;
}

function ActionButton({ actionKey, queueEntry }: { actionKey: QueueEntryAction; queueEntry: QueueEntry }) {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const actionPropsByKey = useActionPropsByKey();
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);

  const actionProps = actionPropsByKey[actionKey];
  if (!actionProps) {
    console.error(`Service queue table configuration uses unknown action in 'action.buttons': ${actionKey}`);
    return null;
  }

  if (actionProps.showIf && !actionProps.showIf(queueEntry)) {
    return null;
  }

  const handleClick = async () => {
    if (isPendingRef.current) {
      return;
    }
    isPendingRef.current = true;
    setIsPending(true);
    try {
      await Promise.resolve(actionProps.onClick(queueEntry));
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  };

  return (
    <Button
      key={actionKey}
      kind="ghost"
      aria-label={t(actionProps.label, actionProps.text)}
      disabled={isPending}
      onClick={handleClick}
      size={isDesktop(layout) ? 'sm' : 'lg'}>
      {t(actionProps.label, actionProps.text)}
    </Button>
  );
}

function ActionOverflowMenuItem({ actionKey, queueEntry }: { actionKey: QueueEntryAction; queueEntry: QueueEntry }) {
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
      let overflowMenuKeys: QueueEntryAction[] = [];
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
