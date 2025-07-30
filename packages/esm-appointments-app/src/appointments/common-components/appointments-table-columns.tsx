import { type TFunction } from 'react-i18next';
import { type AppointmentTableColumn } from '../../types';
import { type AppointmentColumnDefinition, type ConfigObject } from '../../config-schema';
import { appointmentTableNameColumn } from './cells/appointment-table-name-component';
import { appointmentTableIdentifierColumn } from './cells/appointment-table-identifier-component';
import { appointmentTableLocationColumn } from './cells/appointment-table-location-component';
import { appointmentTableServiceTypeColumn } from './cells/appointment-table-servicetype-component';
import { appointmentTableProviderColumn } from './cells/appointment-table-provider-component';
import { appointmentTableStatusColumn } from './cells/appointment-table-status-component';

export function getColumnFromDefinition(
  t: TFunction,
  columnDef: AppointmentColumnDefinition,
  config: ConfigObject,
): AppointmentTableColumn {
  const { id, header, columnType } = columnDef;
  const translatedHeader = header ? t(header) : null;

  switch (columnType ?? id) {
    case 'patient-name':
      return appointmentTableNameColumn(id, translatedHeader ?? t('patientName', 'Patient name'));
    case 'identifier':
      return appointmentTableIdentifierColumn(id, translatedHeader ?? t('identifier', 'Identifier'));
    case 'location':
      return appointmentTableLocationColumn(id, translatedHeader ?? t('location', 'Location'));
    case 'service-type':
      return appointmentTableServiceTypeColumn(id, translatedHeader ?? t('serviceType', 'Service Type'));
    case 'provider':
      return appointmentTableProviderColumn(id, translatedHeader ?? t('provider', 'Provider'));
    case 'status':
      return appointmentTableStatusColumn(id, translatedHeader ?? t('status', 'Status'));
    default:
      throw new Error('Unknown column type from configuration: ' + columnType);
  }
}
