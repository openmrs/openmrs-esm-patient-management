import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import { useProviders } from '../../hooks/useProviders';
import styles from './calendar-filters.scss';

interface ProviderFilterItem {
  id: string;
  label: string;
}

interface CalendarProviderFilterProps {
  selectedProviderUuids: Array<string>;
  onChange: (selectedUuids: Array<string>) => void;
}

/**
 * Multi-select used in the calendar header to filter appointments by provider.
 * The selected UUIDs are sent to the backend as `providerUuids` query params;
 * no filtering happens in the browser.
 */
const CalendarProviderFilter: React.FC<CalendarProviderFilterProps> = ({ selectedProviderUuids, onChange }) => {
  const { t } = useTranslation();
  const { providers, isLoading } = useProviders();

  const items = useMemo<Array<ProviderFilterItem>>(
    () => (providers ?? []).map((provider) => ({ id: provider.uuid, label: provider.display })),
    [providers],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedProviderUuids.includes(item.id)),
    [items, selectedProviderUuids],
  );

  const handleChange = useCallback(
    ({ selectedItems }: { selectedItems: Array<ProviderFilterItem> | null }) => {
      onChange((selectedItems ?? []).map((item) => item.id));
    },
    [onChange],
  );

  const label =
    selectedProviderUuids.length === 0
      ? t('allProviders', 'All providers')
      : t('providerSelectionCount', '{{count}} provider(s)', { count: selectedProviderUuids.length });

  return (
    <MultiSelect
      className={styles.calendarFilter}
      disabled={isLoading}
      id="calendarProviderFilter"
      items={items}
      itemToString={(item) => item?.label ?? ''}
      label={label}
      onChange={handleChange}
      selectedItems={selectedItems}
      selectionFeedback="fixed"
      size="sm"
      titleText={t('provider', 'Provider')}
    />
  );
};

export default CalendarProviderFilter;
