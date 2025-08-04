import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import MetricsCard from './metrics-card.component';
import { updateSelectedService, useServiceQueuesStore } from '../../store/store';
import { useServiceMetricsCount } from '../metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import useQueueServices from '../../hooks/useQueueService';
import { type Service } from '../metrics-container.component';
import { type Concept } from '../../types';

type ServiceListItem = Service | Concept;

export default function WaitingPatientsExtension() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { selectedServiceUuid, selectedServiceDisplay, selectedQueueLocationUuid } = useServiceQueuesStore();
  const { services } = useQueueServices();
  const { serviceCount } = useServiceMetricsCount(selectedServiceUuid, selectedQueueLocationUuid);

  const defaultServiceItem: Service = {
    display: `${t('all', 'All')}`,
  };

  const serviceItems: ServiceListItem[] = [defaultServiceItem, ...(services ?? [])];

  const [initialSelectedItem, setInitialSelectItem] = useState(() => {
    return !selectedServiceDisplay || !selectedServiceUuid;
  });

  const { totalCount, queueEntries } = useQueueEntries({
    service: selectedServiceUuid,
    location: selectedQueueLocationUuid,
    isEnded: false,
  });

  // Calculate urgent cases count
  const urgentCount = queueEntries.filter((entry) => entry.priority?.display?.toLowerCase() === 'urgent').length;

  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedService(selectedItem.uuid, selectedItem.display);
    if (selectedItem.uuid === undefined) {
      setInitialSelectItem(true);
    } else {
      setInitialSelectItem(false);
    }
  };

  return (
    <MetricsCard
      headerLabel=""
      label={t('patients', 'Patients')}
      locationUuid={selectedQueueLocationUuid}
      service={selectedServiceDisplay}
      serviceUuid={selectedServiceUuid}
      value={initialSelectedItem ? (totalCount ?? '--') : serviceCount}
      showUrgent={urgentCount > 0}
      urgentCount={urgentCount}>
      <Dropdown
        id="inline"
        initialSelectedItem={defaultServiceItem}
        items={serviceItems}
        itemToString={(item) =>
          item ? `${item.display} ${item.location?.display ? `- ${item.location.display}` : ''}` : ''
        }
        label=""
        onChange={handleServiceChange}
        size={isDesktop(layout) ? 'sm' : 'lg'}
        titleText={`${t('waitingFor', 'Waiting for')}:`}
        type="inline"
      />
    </MetricsCard>
  );
}
