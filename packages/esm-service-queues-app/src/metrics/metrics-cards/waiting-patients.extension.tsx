import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import MetricsCard from './metrics-card.component';
import { updateSelectedService, useSelectedQueueLocationUuid, useSelectedService } from '../../helpers/helpers';
import { useServiceMetricsCount } from '../queue-metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import useQueueServices from '../../hooks/useQueueService';
import { type Service } from '../metrics-container.component';
import { type Concept } from '../../types';

type ServiceListItem = Service | Concept;

export default function WaitingPatientsExtension() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const currentService = useSelectedService();
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { services } = useQueueServices();
  const { serviceCount } = useServiceMetricsCount(currentService?.serviceUuid, currentQueueLocation);

  const defaultServiceItem: Service = {
    display: `${t('all', 'All')}`,
  };

  const serviceItems: ServiceListItem[] = [defaultServiceItem, ...(services ?? [])];

  const [initialSelectedItem, setInitialSelectItem] = useState(() => {
    return !currentService?.serviceDisplay || !currentService?.serviceUuid;
  });

  const { totalCount } = useQueueEntries({
    service: currentService?.serviceUuid,
    location: currentQueueLocation,
    isEnded: false,
  });

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
      locationUuid={currentQueueLocation}
      service={currentService?.serviceDisplay}
      serviceUuid={currentService?.serviceUuid}
      value={initialSelectedItem ? totalCount ?? '--' : serviceCount}>
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
