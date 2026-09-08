import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import { type AppointmentService } from '../types';
import styles from './filter.scss';

interface ServiceFilterProps {
  services: Array<Pick<AppointmentService, 'uuid' | 'name'>>;
  serviceColorMap?: Map<string, string>;
  selectedServiceUuids: string[];
  onServiceChange: (selectedServiceUuids: string[]) => void;
}

type ServiceItem = { id: string; label: string; color?: string };

const ServiceFilter: React.FC<ServiceFilterProps> = ({
  services,
  serviceColorMap,
  selectedServiceUuids,
  onServiceChange,
}) => {
  const { t } = useTranslation();

  const items = useMemo<ServiceItem[]>(
    () =>
      services.map((service) => ({
        id: service.uuid,
        label: service.name,
        color: serviceColorMap?.get(service.uuid),
      })),
    [services, serviceColorMap],
  );
  const selectedItems = useMemo(
    () => items.filter((item) => selectedServiceUuids.includes(item.id)),
    [items, selectedServiceUuids],
  );

  const handleChange = useCallback(
    ({ selectedItems }: { selectedItems: Array<ServiceItem> }) => onServiceChange(selectedItems.map((item) => item.id)),
    [onServiceChange],
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
