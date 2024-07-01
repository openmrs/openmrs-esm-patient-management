import { showToast, translateFrom, useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import {
  builtInColumns,
  defaultColumnConfig,
  defaultQueueTable,
  type ColumnDefinition,
  type ConfigObject,
} from '../../config-schema';
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
  const { queueTables, visitQueueNumberAttributeUuid } = config;
  const { columnDefinitions } = queueTables;
  const tableDefinitions = [...queueTables.tableDefinitions, defaultQueueTable];
  const globalColumnConfig = {
    ...defaultColumnConfig,
    visitQueueNumberAttributeUuid,
  };

  const columnsMap = useMemo(() => {
    const map = new Map<string, QueueTableColumn>();
    for (const column of builtInColumns) {
      map.set(column, getColumnFromDefinition(t, { id: column, config: globalColumnConfig }));
    }
    for (const columnDef of columnDefinitions) {
      if (columnDef.columnType == 'queue-number' || columnDef.id == 'queue-number') {
        columnDef.config.visitQueueNumberAttributeUuid =
          columnDef.config.visitQueueNumberAttributeUuid ?? visitQueueNumberAttributeUuid;
      }
      map.set(columnDef.id, getColumnFromDefinition(t, columnDef));
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

function getColumnFromDefinition(t: TFunction, columnDef: ColumnDefinition): QueueTableColumn {
  const { id, header, headerI18nModule, columnType } = columnDef;

  const translatedHeader = header ? translateFrom(headerI18nModule ?? '@openmrs/esm-service-queues-app', header) : null;

  switch (columnType ?? id) {
    case 'patient-name': {
      return queueTableNameColumn(id, translatedHeader ?? t('name', 'Name'));
    }
    case 'patient-identifier': {
      return queueTablePatientIdentifierColumn(id, translatedHeader ?? t('patientId', 'Patient Id'), columnDef.config);
    }
    case 'queue-number': {
      return queueTableVisitAttributeQueueNumberColumn(
        id,
        translatedHeader ?? t('queueNumber', 'Queue Number'),
        columnDef.config,
      );
    }
    case 'patient-age': {
      return queueTablePatientAgeColumn(id, translatedHeader ?? t('age', 'Age'));
    }
    case 'priority': {
      return queueTablePriorityColumn(id, translatedHeader ?? t('priority', 'Priority'), columnDef.config);
    }
    case 'status': {
      return queueTableStatusColumn(id, translatedHeader ?? t('status', 'Status'), columnDef.config);
    }
    case 'coming-from': {
      return queueTableComingFromColumn(id, translatedHeader ?? t('comingFrom', 'Coming from'));
    }
    case 'queue': {
      return queueTableQueueNameColumn(id, translatedHeader ?? t('queue', 'Queue'));
    }
    case 'wait-time': {
      return queueTableWaitTimeColumn(id, translatedHeader ?? t('waitTime', 'Wait time'));
    }
    case 'visit-start-time': {
      return queueTableVisitStartTimeColumn(id, translatedHeader ?? t('visitStartTime', 'Visit start time'));
    }
    case 'actions': {
      return queueTableActionColumn(id, translatedHeader ?? t('actions', 'Actions'));
    }
    case 'extension': {
      return queueTableExtensionColumn(id, translatedHeader);
    }
    default: {
      throw new Error('Unknown column type from configuration: ' + columnType);
    }
  }
}
