import React from 'react';
import TransitionMenu from '../queue-entry-table-components/transition-entry.component';
import { type QueueTableCellComponentProps, type QueueEntry } from '../types';
import ActionsMenu from '../queue-entry-table-components/actions-menu.component';
import EditMenu from '../queue-entry-table-components/edit-entry.component';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { mapVisitQueueEntryProperties } from './active-visits-table.resource';
import styles from './active-visits-row-actions.scss';

// This component is meant to be mounted as an extension in the queue-table-extension-column-slot.
// Defines the following actions the user can perform on a queue entry:
// - queue / requeue (to the in-service status)
// - transfer to a different queue
// - Overflow menu action to edit patient detail
// - Overflow menu action to end patient visit
const ActiveVisitRowActionsCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { visitQueueNumberAttributeUuid } = useConfig<ConfigObject>();

  const mappedQueueEntry = mapVisitQueueEntryProperties(queueEntry, visitQueueNumberAttributeUuid);

  return (
    <>
      <div className={styles.transitionMenuContainer}>
        <TransitionMenu queueEntry={mappedQueueEntry} />
      </div>
      <EditMenu queueEntry={mappedQueueEntry} />
      <ActionsMenu queueEntry={mappedQueueEntry} />
    </>
  );
};

export default ActiveVisitRowActionsCell;
