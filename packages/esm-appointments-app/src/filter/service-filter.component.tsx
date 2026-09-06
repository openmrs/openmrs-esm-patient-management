import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import styles from './filter.scss';

export interface ServiceFilterOption {
  uuid: string;
  label: string;
  color?: string;
}

interface ServiceFilterProps {
  options: ServiceFilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

type ServiceItem = { id: string; label: string; color?: string };

const ServiceFilter: React.FC<ServiceFilterProps> = ({ options, selected, onChange }) => {
  const { t } = useTranslation();

  const items = useMemo<ServiceItem[]>(
    () => options.map((option) => ({ id: option.uuid, label: option.label, color: option.color })),
    [options],
  );
  const selectedItems = useMemo(() => items.filter((item) => selected.includes(item.id)), [items, selected]);

  const handleChange = useCallback(
    ({ selectedItems }: { selectedItems: Array<ServiceItem> }) => onChange(selectedItems.map((item) => item.id)),
    [onChange],
  );

  const renderItem = useCallback((item: ServiceItem | null) => {
    if (!item) {
      return null;
    }
    return (
      <span className={styles.filterOptionLabel}>
        {item.color && <span className={styles.serviceColorSwatch} style={{ backgroundColor: item.color }} />}
        <span className={item.color ? styles.filterOptionTextWithColor : ''}>{item.label}</span>
      </span>
    );
  }, []);

  return (
    <MultiSelect
      id="calendar-service-filter"
      items={items}
      itemToString={(item) => item?.label ?? ''}
      itemToElement={renderItem}
      titleText={t('filterByService', 'Service')}
      label={t('allServices', 'All services')}
      selectedItems={selectedItems}
      onChange={handleChange}
    />
  );
};

export default ServiceFilter;
