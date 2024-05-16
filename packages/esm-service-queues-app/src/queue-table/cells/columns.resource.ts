import { showToast, useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import { type ColumnDefinition, type ConfigObject } from '../../config-schema';
import { type QueueTableColumn } from '../../types';
import { queueTableComingFromColumn } from './queue-table-coming-from-cell.component';
import { queueTableExtensionColumn } from './queue-table-extension-cell.component';
import { queueTableNameColumn } from './queue-table-name-cell.component';
import { queueTablePatientAgeColumn } from './queue-table-patient-age-cell.component';
import { queueTablePatientIdentifierColumn } from './queue-table-patient-identifier-cell.component';
import { queueTablePriorityColumn } from './queue-table-priority-cell.component';
import { queueTableQueueNameColumn } from './queue-table-queue-name-cell.component';
import { queueTableStatusColumn } from './queue-table-status-cell.component';
import { queueTableVisitAttributeQueueNumberColumn } from './queue-table-visit-attribute-queue-number-cell.component';
import { queueTableVisitStartTimeColumn } from './queue-table-visit-start-time-cell.component';
import { queueTableWaitTimeColumn } from './queue-table-wait-time-cell.component';
import { queueTableActionColumn } from './queue-table-action-cell.component';

// returns the columns to display for a queue table of a particular queue + status.
// For a table displaying all entries of a particular queue, the status param should be null
// For a table displaying all entries from all queues, both params should be null
export function useColumns(queue: string, status: string): QueueTableColumn[] {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { tablesConfig, visitQueueNumberAttributeUuid } = config;
  const { columnDefinitions, tableDefinitions } = tablesConfig;

  const columnsMap = useMemo(() => {
    const map = new Map<string, QueueTableColumn>();
    for (const columnDef of columnDefinitions) {
      map.set(columnDef.id, getColumnFromDefinition(t, columnDef, visitQueueNumberAttributeUuid));
    }
    return map;
  }, [columnDefinitions, t]);

  const tableDefinition = useMemo(
    () =>
      tableDefinitions.find((tableDef) => {
        const appliedTo = tableDef.appliedTo;

        return (
          appliedTo == null ||
          appliedTo.some(
            (criteria) =>
              (criteria.queue == null || criteria.queue == queue) &&
              (criteria.status == null || criteria.status == status),
          )
        );
      }),
    [tableDefinitions, queue, status],
  );

  const columns = tableDefinition?.columns?.map((columnId) => {
    const column = columnsMap.get(columnId);
    if (!column) {
      showToast({
        title: t('invalidColumnConfig', 'Invalid column config'),
        kind: 'warning',
        description: 'Unknown column id: ' + columnId,
      });
    }
    return column;
  });
  return columns;
}

function getColumnFromDefinition(
  t: TFunction,
  columnDef: ColumnDefinition,
  visitQueueNumberAttributeUuid: string,
): QueueTableColumn {
  const { id, header, columnType } = columnDef;

  // TODO: make it possible to use header translation key from another module O3-3138
  const translatedHeader = header ? t(header) : null;

  switch (columnType) {
    case 'patient-name-column': {
      return queueTableNameColumn(id, translatedHeader ?? t('name', 'Name'));
    }
    case 'patient-identifier-column': {
      return queueTablePatientIdentifierColumn(id, translatedHeader ?? t('patientId', 'Patient Id'), columnDef.config);
    }
    case 'visit-attribute-queue-number-column': {
      // use visitQueueNumberAttributeUuid from ConfigObject for now to keep backward compatibility
      // TODO: change it to use the value passed in from columnDef.config instead when ready
      return queueTableVisitAttributeQueueNumberColumn(id, translatedHeader ?? t('queueNumber', 'Queue Number'), {
        visitQueueNumberAttributeUuid,
      });
    }
    case 'patient-age-column': {
      return queueTablePatientAgeColumn(id, translatedHeader ?? t('age', 'Age'));
    }
    case 'priority-column': {
      return queueTablePriorityColumn(id, translatedHeader ?? t('priority', 'Priority'), columnDef.config);
    }
    case 'status-column': {
      return queueTableStatusColumn(id, translatedHeader ?? t('status', 'Status'), columnDef.config);
    }
    case 'queue-coming-from-column': {
      return queueTableComingFromColumn(id, translatedHeader ?? t('comingFrom', 'Coming from'));
    }
    case 'current-queue-column': {
      return queueTableQueueNameColumn(id, translatedHeader ?? t('queue', 'Queue'));
    }
    case 'wait-time-column': {
      return queueTableWaitTimeColumn(id, translatedHeader ?? t('waitTime', 'Wait time'));
    }
    case 'visit-start-time-column': {
      return queueTableVisitStartTimeColumn(id, translatedHeader ?? t('visitStartTime', 'Visit start time'));
    }
    case 'actions-column': {
      return queueTableActionColumn(id, translatedHeader ?? t('actions', 'Actions'));
    }
    case 'extension-column': {
      // this is a column that only has the queue-table-extension-column-slot extension slot
      // it can be further configured with columnDef.config
      return queueTableExtensionColumn(id, translatedHeader, columnDef.config);
    }
    default: {
      throw new Error('Unknown column type from configuration: ' + columnType);
    }
  }
}
