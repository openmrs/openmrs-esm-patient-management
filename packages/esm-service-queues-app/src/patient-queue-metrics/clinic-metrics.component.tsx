import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { updateSelectedService, useSelectedService, useSelectedQueueLocationUuid } from '../helpers/helpers';
import { useActiveVisits, useAverageWaitTime } from './clinic-metrics.resource';
import { useServiceMetricsCount } from './queue-metrics.resource';
import { useQueueEntries } from '../hooks/useQueueEntries';
import useQueueServices from '../hooks/useQueueService';
import { type Concept } from '../types';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './clinic-metrics.scss';

export interface Service {
  display: string;
  uuid?: string;
}

type ServiceListItem = Service | Concept;

function ClinicMetrics() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const currentService = useSelectedService();

  const { services } = useQueueServices();
  const { serviceCount } = useServiceMetricsCount(currentService?.serviceUuid, currentQueueLocation);

  const [initialSelectedItem, setInitialSelectItem] = useState(() => {
    return !currentService?.serviceDisplay || !currentService?.serviceUuid;
  });

  const { totalCount } = useQueueEntries({
    service: currentService?.serviceUuid,
    location: currentQueueLocation,
    isEnded: false,
  });

  const { activeVisitsCount, isLoading: loading } = useActiveVisits();
  const { waitTime } = useAverageWaitTime(currentService?.serviceUuid, '');

  const defaultServiceItem: Service = {
    display: `${t('all', 'All')}`,
  };

  const serviceItems: ServiceListItem[] = [defaultServiceItem, ...(services ?? [])];

  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedService(selectedItem.uuid, selectedItem.display);
    if (selectedItem.uuid === undefined) {
      setInitialSelectItem(true);
    } else {
      setInitialSelectItem(false);
    }
  };

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricsCard
          headerLabel={t('checkedInPatients', 'Checked in patients')}
          label={t('patients', 'Patients')}
          service="scheduled"
          value={loading ? '--' : activeVisitsCount}
        />
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
        <MetricsCard
          label={t('minutes', 'Minutes')}
          headerLabel={t('averageWaitTime', 'Average wait time today')}
          service="waitTime"
          value={waitTime ? waitTime.averageWaitTime : '--'}
        />
      </div>
    </>
  );
}

export default ClinicMetrics;
