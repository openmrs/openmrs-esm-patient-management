import { type TFunction, useTranslation } from 'react-i18next';
import { type QueueTableColumn } from '../../types';
import { queueTableNameColumn } from './queue-table-name-cell.component';
import { queueTablePatientIdColumn } from './queue-table-patient-id-cell.component';
import { queueTablePriorityColumn } from './queue-table-priority-cell.component';
import { queueTableStatusColumn } from './queue-table-status-cell.component';
import { queueTableComingFromColumn } from './queue-table-coming-from-cell.component';
import { queueTableQueueColumn } from './queue-table-queue-cell.component';
import { queueTableWaitTimeColumn } from './queue-table-wait-time-cell.component';
import { useMemo } from 'react';
import { type ColumnDefinition, type ConfigObject } from '../../config-schema';
import { useConfig } from '@openmrs/esm-framework';
import { activeVisitActionsColumn } from '../../active-visits/active-visits-row-actions.component';

// returns the columns to display for a queue table of a particular queue + status.
// For a table displaying all entries of a particular queue, the status param should be null
// For a table displaying all entries from all queues, both params should be null
export function useColumns(queue: string, status: string): QueueTableColumn[] {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { tablesConfig } = config;
  const { columnDefinitions, tableDefinitions } = tablesConfig;

  const columnsMap = useMemo(() => {
    const map = new Map<string, QueueTableColumn>();
    for (const columnDef of columnDefinitions) {
      map.set(columnDef.id, getColumnFromDefinition(t, columnDef));
    }
    return map;
  }, [columnDefinitions, t]);

  const tableDefinition = useMemo(
    () =>
      tableDefinitions.find((tableDef) => {
        const appliedTo = tableDef.appliedTo ?? { queue: null, status: null };
        return (
          (appliedTo.queue == null || appliedTo.queue == queue) &&
          (appliedTo.status == null || appliedTo.status == status)
        );
      }),
    [tableDefinitions, queue, status],
  );

  const columns = tableDefinition?.columns?.map((column) => columnsMap.get(column));
  return columns;
}

function getColumnFromDefinition(t: TFunction, columnDef: ColumnDefinition): QueueTableColumn {
  const { id, header, columnType } = columnDef;

  switch (columnType) {
    case 'patient-name-column': {
      return queueTableNameColumn(id, header ?? t('name', 'Name'));
    }
    case 'patient-id-column': {
      return queueTablePatientIdColumn(id, header ?? t('patientId', 'Patient Id'), columnDef.config);
    }
    case 'patient-age-column': {
      return null; // TODO
    }
    case 'priority-column': {
      return queueTablePriorityColumn(id, header ?? t('priority', 'Priority'), columnDef.config);
    }
    case 'status-column': {
      return queueTableStatusColumn(id, header ?? t('status', 'Status'), columnDef.config);
    }
    case 'queue-coming-from-column': {
      return queueTableComingFromColumn(id, header ?? t('comingFrom', 'Coming from'));
    }
    case 'current-queue-column': {
      return queueTableQueueColumn(id, header ?? t('queue', 'Queue'));
    }
    case 'wait-time-column': {
      return queueTableWaitTimeColumn(id, header ?? t('waitTime', 'Wait time'));
    }
    case 'visit-start-time-column': {
      return null; // TODO
    }
    case 'active-visits-actions-column': {
      return activeVisitActionsColumn(id, header ?? t('actions', 'Actions'));
    }
    case 'actions-column': {
      return null; // TODO: a more configurable actions column to define quick actions and actions in overflow menu
    }
    case 'extension-column': {
      return null; // TODO: this is a column that only has an extension slot
      // it can do whatever it needs to based on columnDef.config
    }
    default: {
      throw new Error('Unknown column type from configuration: ' + columnType);
    }
  }
}
