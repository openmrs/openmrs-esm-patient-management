import React from 'react';
import TransitionMenu from '../queue-entry-table-components/transition-entry.component';
import { type QueueTableCellComponentProps, type QueueEntry } from '../types';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { mapVisitQueueEntryProperties } from './active-visits-table.resource';
import styles from './active-visits-row-actions.scss';

// This component is meant to be mounted as an extension in the queue-table-extension-column-slot.
// Defines the following actions the user can perform on a queue entry:
// - queue / requeue (to the in-service status)

const ActiveVisitRowActionsCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { visitQueueNumberAttributeUuid } = useConfig<ConfigObject>();

  const mappedQueueEntry = mapVisitQueueEntryProperties(queueEntry, visitQueueNumberAttributeUuid);

  return (
    <div className={styles.transitionMenuContainer}>
      <TransitionMenu queueEntry={mappedQueueEntry} />
    </div>
  );
};

export default ActiveVisitRowActionsCell;
