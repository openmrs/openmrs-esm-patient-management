import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import { useLocations } from '@openmrs/esm-framework';
import { appointmentLocationTagName } from '../../constants';
import styles from './calendar-filters.scss';

interface LocationFilterItem {
  id: string;
  label: string;
}

interface CalendarLocationFilterProps {
  selectedLocationUuids: Array<string>;
  onChange: (selectedUuids: Array<string>) => void;
}

/**
 * Multi-select used in the calendar header to filter appointments by location.
 * Lists the locations tagged as appointment locations, the same set the booking form offers.
 * The selected UUIDs are sent to the backend as `locationUuids` query params;
 * no filtering happens in the browser.
 */
const CalendarLocationFilter: React.FC<CalendarLocationFilterProps> = ({ selectedLocationUuids, onChange }) => {
  const { t } = useTranslation();
  const locations = useLocations(appointmentLocationTagName);

  const items = useMemo<Array<LocationFilterItem>>(
    () =>
      (locations ?? [])
        .map((location) => ({ id: location.uuid, label: location.display }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [locations],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedLocationUuids.includes(item.id)),
    [items, selectedLocationUuids],
  );

  const handleChange = useCallback(
    ({ selectedItems }: { selectedItems: Array<LocationFilterItem> | null }) => {
      onChange((selectedItems ?? []).map((item) => item.id));
    },
    [onChange],
  );

  const label =
    selectedLocationUuids.length === 0
      ? t('allLocations', 'All locations')
      : t('locationSelectionCount', '{{count}} location(s)', { count: selectedLocationUuids.length });

  return (
    <MultiSelect
      className={styles.calendarFilter}
      id="calendarLocationFilter"
      items={items}
      itemToString={(item) => item?.label ?? ''}
      label={label}
      onChange={handleChange}
      selectedItems={selectedItems}
      selectionFeedback="fixed"
      size="sm"
      titleText={t('location', 'Location')}
    />
  );
};

export default CalendarLocationFilter;
