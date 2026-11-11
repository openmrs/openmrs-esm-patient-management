import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import { useLocations } from '@openmrs/esm-framework';
import { appointmentLocationTagName } from '../../constants';
import styles from './calendar-location-filter.scss';

interface LocationFilterItem {
  id: string;
  label: string;
}

interface CalendarLocationFilterProps {
  selectedLocationUuids: Array<string>;
  onChange: (locationUuids: Array<string>) => void;
}

const CalendarLocationFilter: React.FC<CalendarLocationFilterProps> = ({ selectedLocationUuids, onChange }) => {
  const { t } = useTranslation();
  const locations = useLocations(appointmentLocationTagName);

  // MultiSelect resets its internal state when it gets a new items array, so both arrays are kept stable
  const items = useMemo<Array<LocationFilterItem>>(
    () => locations.map((location) => ({ id: location.uuid, label: location.display })),
    [locations],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedLocationUuids.includes(item.id)),
    [items, selectedLocationUuids],
  );

  const selectionSummary =
    selectedItems.length === 0
      ? t('allLocations', 'All locations')
      : t('locationCount', '{{count}} location', { count: selectedItems.length });

  const handleChange = ({ selectedItems }: { selectedItems: Array<LocationFilterItem> | null }) => {
    onChange((selectedItems ?? []).map((item) => item.id));
  };

  return (
    <MultiSelect
      className={styles.locationFilter}
      id="calendarLocationFilter"
      items={items}
      itemToString={(item) => item?.label ?? ''}
      label={selectionSummary}
      onChange={handleChange}
      selectedItems={selectedItems}
      size="sm"
      titleText={t('location', 'Location')}
    />
  );
};

export default CalendarLocationFilter;
