import React from 'react';
import TransitionMenu from '../queue-entry-table-components/transition-entry.component';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../types';
import ActionsMenu from '../queue-entry-table-components/actions-menu.component';
import EditMenu from '../queue-entry-table-components/edit-entry.component';
import { translateFrom, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { mapVisitQueueEntryProperties } from './active-visits-table.resource';
import styles from './active-visits-row-actions.scss';

// table column definition containing actions user can perform to each row.
export const ActiveVisitRowActionsCell = ({ queueEntry }: QueueTableCellComponentProps) => {
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

export const activeVisitActionsColumn: QueueTableColumn = {
  header: translateFrom('@openmrs/esm-service-queues-app', 'actions', 'Actions'),
  CellComponent: ActiveVisitRowActionsCell,
  getFilterableValue: null,
};
