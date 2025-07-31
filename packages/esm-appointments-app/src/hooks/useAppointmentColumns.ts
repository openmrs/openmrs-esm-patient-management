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
  const { appointmentsTableColumns } = config;

  const columnsMap = useMemo(() => {
    const map = new Map<string, AppointmentTableColumn>();

    for (const columnType of appointmentColumnTypes) {
      if (appointmentsTableColumns.includes(columnType)) {
        map.set(columnType, getColumnFromDefinition(t, { id: columnType }));
      }
    }
    return map;
  }, [appointmentsTableColumns, t]);

  return Array.from(columnsMap.keys())
    .map((columnId) => columnsMap.get(columnId))
    .filter((column): column is AppointmentTableColumn => column !== undefined);
}
