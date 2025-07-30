import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { getColumnFromDefinition } from '../appointments/common-components/appointments-table-columns';
import { appointmentColumnTypes } from '../config-schema';
import { type AppointmentTableColumn } from '../types';

export function useAppointmentColumns(): Array<AppointmentTableColumn> {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { appointmentTables } = config;
  const { tableDefinitions, columnDefinitions } = appointmentTables;

  // Convert to Set for faster lookups and deduplication
  const allColumnIds = useMemo(
    () => new Set(tableDefinitions.flatMap((tableDef) => tableDef.columns)),
    [tableDefinitions],
  );

  const columnsMap = useMemo(() => {
    const map = new Map<string, AppointmentTableColumn>();

    for (const columnType of appointmentColumnTypes) {
      if (allColumnIds.has(columnType)) {
        map.set(columnType, getColumnFromDefinition(t, { id: columnType, config: {} }, config));
      }
    }

    for (const columnDef of columnDefinitions) {
      if (allColumnIds.has(columnDef.id)) {
        map.set(columnDef.id, getColumnFromDefinition(t, columnDef, config));
      }
    }

    return map;
  }, [allColumnIds, columnDefinitions, t, config]);

  return Array.from(allColumnIds)
    .map((columnId) => columnsMap.get(columnId))
    .filter((column): column is AppointmentTableColumn => column !== undefined);
}
