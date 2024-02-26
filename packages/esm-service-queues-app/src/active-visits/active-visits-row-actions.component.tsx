import React, { FC } from 'react';
import TransitionMenu from '../queue-entry-table-components/transition-entry.component';
import { QueueTableCellComponentProps, QueueTableColumn } from '../types';
import ActionsMenu from '../queue-entry-table-components/actions-menu.component';
import EditMenu from '../queue-entry-table-components/edit-entry.component';
import { useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { mapVisitQueueEntryProperties } from './active-visits-table.resource';

export const ActiveVisitRowActionsCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { visitQueueNumberAttributeUuid } = useConfig<ConfigObject>();

  const mappedQueueEntry = mapVisitQueueEntryProperties(queueEntry, visitQueueNumberAttributeUuid);

  return (
    <>
      <TransitionMenu queueEntry={mappedQueueEntry} />
      <EditMenu queueEntry={mappedQueueEntry} />
      <ActionsMenu queueEntry={mappedQueueEntry} />
    </>
  );
};

export const activeVisitActionsColumn: QueueTableColumn = {
  headerI18nKey: '',
  CellComponent: ActiveVisitRowActionsCell,
};
