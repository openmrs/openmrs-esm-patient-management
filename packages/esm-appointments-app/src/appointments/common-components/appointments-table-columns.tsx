import { type TFunction } from 'react-i18next';
import { type AppointmentTableColumn } from '../../types';
import { type AppointmentColumnDefinition } from '../../config-schema';

export function getColumnFromDefinition(t: TFunction, columnDef: AppointmentColumnDefinition): AppointmentTableColumn {
  const { id, header, columnType } = columnDef;
  const translatedHeader = header ? t(header) : null;

  switch (columnType ?? id) {
    case 'patient-name':
      return { key: id, header: translatedHeader ?? t('patientName', 'Patient name') };
    case 'identifier':
      return { key: id, header: translatedHeader ?? t('identifier', 'Identifier') };
    case 'location':
      return { key: id, header: translatedHeader ?? t('location', 'Location') };
    case 'service-type':
      return { key: id, header: translatedHeader ?? t('serviceType', 'Service Type') };
    case 'provider':
      return { key: id, header: translatedHeader ?? t('provider', 'Provider') };
    case 'status':
      return { key: id, header: translatedHeader ?? t('status', 'Status') };
    default:
      throw new Error('Unknown column type from configuration: ' + columnType);
  }
}
