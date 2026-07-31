import React, { useMemo, useRef, useState } from 'react';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { type TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { isDesktop, showModal, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps, type QueueEntry } from '../../types';
import {
  deprecatedQueueEntryActions,
  type ActionsColumnConfig,
  type ConfigObject,
  type ConfigurableQueueEntryAction,
  type QueueEntryAction,
} from '../../config-schema';
import { getVisitQueueNumber, serveQueueEntry } from '../../service-queues.resource';
import { getErrorMessage } from '../../modals/queue-entry-error.utils';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import styles from './queue-table-action-cell.scss';

type ActionProps = {
  label: string;
  text: string;
  onClick: (queueEntry: QueueEntry) => void | Promise<void>;
  showIf?: (queueEntry: QueueEntry) => boolean;
  isDelete?: boolean;
};

// `getErrorMessage` digs the server's own wording out of an `OpenmrsFetchError`, which is far more
// useful than "Server responded with 500 ...", but it returns an empty string when there is nothing
// to report — a rejected `undefined`, say — and an error snackbar with no subtitle says nothing.
function showActionErrorSnackbar(title: string, error: unknown, t: TFunction) {
  showSnackbar({
    isLowContrast: false,
    kind: 'error',
    title,
    subtitle: getErrorMessage(error) || t('unknownError', 'An unknown error occurred'),
  });
}

// Row actions are invoked from DOM event handlers, which ignore the promise an async action returns.
// Actions are expected to report their own failures to the user; this is the last-resort net that
// keeps a rejection from becoming an unhandled promise rejection, which React's development-only
// error overlay turns into a full-screen crash the user can only escape by reloading the page. It
// still tells the user something went wrong, because a click that silently does nothing is the
// production half of the same defect.
function runAction(actionKey: QueueEntryAction, actionProps: ActionProps, queueEntry: QueueEntry, t: TFunction) {
  return Promise.resolve()
    .then(() => actionProps.onClick(queueEntry))
    .catch((error) => {
      console.error(`Service queue table action '${actionKey}' failed`, error);
      showActionErrorSnackbar(t('queueEntryActionFailed', 'Action failed'), error, t);
    });
}

// Resolves deprecated action names to the actions that replaced them, dropping duplicates in case a
// configuration lists both a deprecated action and its replacement.
function normalizeActions(actionKeys: ConfigurableQueueEntryAction[], configKey: string): QueueEntryAction[] {
  const normalized: QueueEntryAction[] = [];
  for (const actionKey of actionKeys) {
    const replacement = deprecatedQueueEntryActions[actionKey as keyof typeof deprecatedQueueEntryActions];
    if (replacement) {
      console.warn(
        `Service queue table configuration uses the deprecated action '${actionKey}' in '${configKey}'. Use '${replacement}' instead.`,
      );
    }
    const resolved = replacement ?? (actionKey as QueueEntryAction);
    if (!normalized.includes(resolved)) {
      normalized.push(resolved);
    }
  }
  return normalized;
}

function useActionPropsByKey() {
  const { t } = useTranslation();
  const {
    callingStatus,
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
          const servicePointName = queueEntry.queue?.name;
          const ticketNumber = getVisitQueueNumber(queueEntry, visitQueueNumberAttributeUuid);

          // The assignticket endpoint needs all three values, so say which one is missing rather
          // than posting an incomplete request and reporting whatever the server makes of it. The
          // ticket number is singled out because it is the one that is missing in ordinary use:
          // it comes from a visit attribute, so any visit created outside the queue flow lacks it,
          // and telling that user to go and check the configuration would be wrong advice.
          if (!servicePointName || !ticketNumber || !callingStatus) {
            showSnackbar({
              isLowContrast: false,
              kind: 'error',
              title: t('errorCallingPatient', 'Error calling patient'),
              subtitle: ticketNumber
                ? t(
                    'callPatientMissingConfiguration',
                    'The queue name or calling status is missing. Check the service queues configuration.',
                  )
                : t(
                    'callPatientNoTicketNumber',
                    "This patient's visit has no ticket number, so there is nothing for the queue screen to call.",
                  ),
            });
            return;
          }

          try {
            const callingQueueResponse = await serveQueueEntry(servicePointName, ticketNumber, callingStatus);
            // `openmrsFetch` rejects on any non-2xx, so this is not the ordinary server-error path.
            // It catches the case where it resolves without a response at all, which it does while
            // it is redirecting the browser after an authentication failure.
            if (!callingQueueResponse?.ok) {
              throw new Error(t('unexpectedServerResponse', 'Unexpected Server Response'));
            }
            await mutateQueueEntries();
            const dispose = showModal('call-queue-entry-modal', {
              closeModal: () => dispose(),
              queueEntry,
              size: 'sm',
            });
          } catch (error) {
            showActionErrorSnackbar(t('errorCallingPatient', 'Error calling patient'), error, t);
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
  }, [callingStatus, defaultStatusConceptUuid, visitQueueNumberAttributeUuid, mutateQueueEntries, t]);
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
      await runAction(actionKey, actionProps, queueEntry, t);
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
      onClick={() => void runAction(actionKey, actionProps, queueEntry, t)}
      itemText={t(actionProps.label, actionProps.text)}
    />
  );
}

export const queueTableActionColumn: QueueTableColumnFunction = (key, header, config: ActionsColumnConfig) => {
  const buttons = normalizeActions(config.actions.buttons, 'actions.buttons');
  const overflowMenu = normalizeActions(config.actions.overflowMenu, 'actions.overflowMenu').filter(
    (actionKey) => !buttons.includes(actionKey),
  );

  const QueueTableActionCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    const layout = useLayoutType();
    const actionPropsByKey = useActionPropsByKey();

    const [buttonComponents, overflowMenuComponents] = useMemo(() => {
      const declaredButtonComponents = buttons
        .map((actionKey) => {
          const actionProps = actionPropsByKey[actionKey];
          if (!actionProps) {
            console.error(`Service queue table configuration uses unknown action in 'actions.buttons': ${actionKey}`);
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
          const actionProps = actionPropsByKey[actionKey];
          if (!actionProps) {
            // Logged by ActionOverflowMenuItem when it renders this key.
            return false;
          }
          return !actionProps.showIf || actionProps.showIf(queueEntry);
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
    }, [queueEntry, actionPropsByKey]);

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
