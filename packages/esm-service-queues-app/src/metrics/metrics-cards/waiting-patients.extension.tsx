import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import { isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { MetricsCard, MetricsCardBody, MetricsCardHeader, MetricsCardItem } from './metrics-card.component';
import { useServiceMetricsCount } from '../metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import useQueueServices from '../../hooks/useQueueService';
import { type Service } from '../metrics-container.component';
import { type Concept } from '../../types';
import { type ConfigObject } from '../../config-schema';
import { updateSelectedService, useServiceQueuesStore } from '../../store/store';

type ServiceListItem = Service | Concept;

export default function WaitingPatientsExtension() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { selectedServiceUuid, selectedServiceDisplay, selectedQueueLocationUuid } = useServiceQueuesStore();
  const { services } = useQueueServices();
  const { serviceCount } = useServiceMetricsCount(selectedServiceUuid, selectedQueueLocationUuid);
  const {
    concepts: { defaultStatusConceptUuid },
  } = useConfig<ConfigObject>();

  const defaultServiceItem: Service = {
    display: `${t('all', 'All')}`,
  };

  const serviceItems: ServiceListItem[] = [defaultServiceItem, ...(services ?? [])];
  const selectedServiceItem =
    serviceItems.find((item) => item.uuid === selectedServiceUuid) ??
    (selectedServiceUuid && selectedServiceDisplay
      ? ({ uuid: selectedServiceUuid, display: selectedServiceDisplay } as Concept)
      : defaultServiceItem);

  const { totalCount, queueEntries } = useQueueEntries({
    service: selectedServiceUuid,
    location: selectedQueueLocationUuid,
    isEnded: false,
    status: defaultStatusConceptUuid,
  });

  const urgentCount = queueEntries.filter((entry) => entry.priority?.display?.toLowerCase() === 'urgent').length;

  const handleServiceChange = ({ selectedItem }) => {
    if (!selectedItem?.uuid) {
      updateSelectedService(null, t('all', 'All'));
      return;
    }

    updateSelectedService(selectedItem.uuid, selectedItem.display);
  };

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('waitingFor', 'Waiting for') + ':'}>
        <Dropdown
          id="inline"
          items={serviceItems}
          itemToString={(item) =>
            item ? `${item.display} ${item.location?.display ? `- ${item.location.display}` : ''}` : ''
          }
          label=""
          selectedItem={selectedServiceItem}
          titleText=""
          onChange={handleServiceChange}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          type="inline"
        />
      </MetricsCardHeader>
      <MetricsCardBody>
        <MetricsCardItem
          label={t('patients', 'Patients')}
          value={!selectedServiceUuid ? (totalCount ?? '--') : serviceCount}
        />
        <MetricsCardItem label={t('urgent', 'Urgent')} value={urgentCount > 0 ? urgentCount : null} color="red" small />
      </MetricsCardBody>
    </MetricsCard>
  );
}
