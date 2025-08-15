import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import { isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { MetricsCard, MetricsCardBody, MetricsCardHeader, MetricsCardItem } from './metrics-card.component';
import { updateSelectedService, useSelectedQueueLocationUuid, useSelectedService } from '../../helpers/helpers';
import { useServiceMetricsCount } from '../metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import useQueueServices from '../../hooks/useQueueService';
import { type Service } from '../metrics-container.component';
import { type Concept } from '../../types';
import { type ConfigObject } from '../../config-schema';

type ServiceListItem = Service | Concept;

export default function WaitingPatientsExtension() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const currentService = useSelectedService();
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { services } = useQueueServices();
  const { serviceCount } = useServiceMetricsCount(currentService?.serviceUuid, currentQueueLocation);
  const {
    concepts: { defaultStatusConceptUuid },
  } = useConfig<ConfigObject>();

  const defaultServiceItem: Service = {
    display: `${t('all', 'All')}`,
  };

  const serviceItems: ServiceListItem[] = [defaultServiceItem, ...(services ?? [])];

  const [initialSelectedItem, setInitialSelectItem] = useState(() => {
    return !currentService?.serviceDisplay || !currentService?.serviceUuid;
  });

  const { totalCount, queueEntries } = useQueueEntries({
    service: currentService?.serviceUuid,
    location: currentQueueLocation,
    isEnded: false,
    status: defaultStatusConceptUuid,
  });

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
    <MetricsCard>
      <MetricsCardHeader title={t('waitingFor', 'Waiting for') + ':'}>
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
          type="inline"
        />
      </MetricsCardHeader>
      <MetricsCardBody>
        <MetricsCardItem
          label={t('patients', 'Patients')}
          value={initialSelectedItem ? (totalCount ?? '--') : serviceCount}
        />
        <MetricsCardItem label={t('urgent', 'Urgent')} value={urgentCount > 0 ? urgentCount : null} color="red" small />
      </MetricsCardBody>
    </MetricsCard>
  );
}
