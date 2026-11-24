import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import { useAppointmentServices } from '../../hooks/useAppointmentService';
import styles from './calendar-filters.scss';

interface ServiceFilterItem {
  id: string;
  label: string;
}

interface CalendarServiceFilterProps {
  selectedServiceUuids: Array<string>;
  onChange: (selectedUuids: Array<string>) => void;
}

/**
 * Multi-select used in the calendar header to filter appointments by service.
 * The selected UUIDs are sent to the backend as `serviceUuids` query params;
 * no filtering happens in the browser.
 */
const CalendarServiceFilter: React.FC<CalendarServiceFilterProps> = ({ selectedServiceUuids, onChange }) => {
  const { t } = useTranslation();
  const { serviceTypes, isLoading } = useAppointmentServices();

  const items = useMemo<Array<ServiceFilterItem>>(
    () => (serviceTypes ?? []).map((service) => ({ id: service.uuid, label: service.name })),
    [serviceTypes],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedServiceUuids.includes(item.id)),
    [items, selectedServiceUuids],
  );

  const handleChange = useCallback(
    ({ selectedItems }: { selectedItems: Array<ServiceFilterItem> | null }) => {
      onChange((selectedItems ?? []).map((item) => item.id));
    },
    [onChange],
  );

  const label =
    selectedServiceUuids.length === 0
      ? t('allServices', 'All services')
      : t('serviceSelectionCount', '{{count}} service(s)', { count: selectedServiceUuids.length });

  return (
    <MultiSelect
      className={styles.calendarFilter}
      disabled={isLoading}
      id="calendarServiceFilter"
      items={items}
      itemToString={(item) => item?.label ?? ''}
      label={label}
      onChange={handleChange}
      selectedItems={selectedItems}
      selectionFeedback="fixed"
      size="sm"
      titleText={t('service', 'Service')}
    />
  );
};

export default CalendarServiceFilter;
