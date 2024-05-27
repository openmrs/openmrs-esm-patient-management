import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import { updateSelectedService, useSelectedService, useSelectedQueueLocationUuid } from '../helpers/helpers';
import { useActiveVisits, useAverageWaitTime } from './clinic-metrics.resource';
import { useServiceMetricsCount } from './queue-metrics.resource';
import styles from './clinic-metrics.scss';
import { useQueues } from '../hooks/useQueues';
import { useQueueEntries } from '../hooks/useQueueEntries';
import useQueueServices from '../hooks/useQueueService';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';

export interface Service {
  uuid: string;
  display: string;
}

function ClinicMetrics() {
  const { t } = useTranslation();
  const layout = useLayoutType();

  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { services } = useQueueServices();
  const currentService = useSelectedService();
  const { serviceCount } = useServiceMetricsCount(currentService?.serviceUuid, currentQueueLocation);
  const [initialSelectedItem, setInitialSelectItem] = useState(() => {
    if (currentService?.serviceDisplay && currentService?.serviceUuid) {
      return false;
    } else if (currentService?.serviceDisplay === t('all', 'All')) {
      return true;
    } else {
      return true;
    }
  });
  const { totalCount } = useQueueEntries({
    service: currentService?.serviceUuid,
    location: currentQueueLocation,
    isEnded: false,
  });
  const { activeVisitsCount, isLoading: loading } = useActiveVisits();
  const { waitTime } = useAverageWaitTime(currentService?.serviceUuid, '');

  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedService(selectedItem.uuid, selectedItem.display);
    if (selectedItem.uuid == undefined) {
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
          label={t('patients', 'Patients')}
          value={loading ? '--' : activeVisitsCount}
          headerLabel={t('checkedInPatients', 'Checked in patients')}
          service="scheduled"
        />
        <MetricsCard
          label={t('patients', 'Patients')}
          value={initialSelectedItem ? totalCount ?? '--' : serviceCount}
          headerLabel={`${t('waitingFor', 'Waiting for')}:`}
          service={currentService?.serviceDisplay}
          serviceUuid={currentService?.serviceUuid}
          locationUuid={currentQueueLocation}>
          <Dropdown
            id="inline"
            type="inline"
            items={[{ display: `${t('all', 'All')}` }, ...(services ?? [])]}
            itemToString={(item) =>
              item ? `${item.display} ${item.location?.display ? `- ${item.location.display}` : ''}` : ''
            }
            onChange={handleServiceChange}
            size={isDesktop(layout) ? 'sm' : 'lg'}
          />
        </MetricsCard>
        <MetricsCard
          label={t('minutes', 'Minutes')}
          value={waitTime ? waitTime.averageWaitTime : '--'}
          headerLabel={t('averageWaitTime', 'Average wait time today')}
          service="waitTime"
        />
      </div>
    </>
  );
}

export default ClinicMetrics;
