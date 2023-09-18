import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import {
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useSelectedServiceName,
  useSelectedServiceUuid,
  useSelectedQueueLocationUuid,
} from '../helpers/helpers';
import { useActiveVisits, useAverageWaitTime } from './clinic-metrics.resource';
import { useServiceMetricsCount, useServices } from './queue-metrics.resource';
import { useVisitQueueEntries } from '../active-visits/active-visits-table.resource';
import styles from './clinic-metrics.scss';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';

export interface Service {
  uuid: string;
  display: string;
}

function ClinicMetrics() {
  const { t } = useTranslation();

  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { queueLocations } = useQueueLocations();
  const { allServices } = useServices(currentQueueLocation ?? queueLocations?.[0]?.id);
  const currentServiceUuid = useSelectedServiceUuid();
  const currentServiceName = useSelectedServiceName();
  const { serviceCount } = useServiceMetricsCount(currentServiceName, currentQueueLocation ?? queueLocations?.[0]?.id);
  const [initialSelectedItem, setInitialSelectItem] = useState(() => {
    if (currentServiceName && currentServiceUuid) {
      return false;
    } else if (currentServiceName === t('all', 'All')) {
      return true;
    } else {
      return true;
    }
  });
  const { visitQueueEntriesCount } = useVisitQueueEntries(currentServiceName, currentQueueLocation);
  const { activeVisitsCount, isLoading: loading } = useActiveVisits();
  const { waitTime } = useAverageWaitTime(currentServiceUuid, '');

  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedServiceUuid(selectedItem.uuid);
    updateSelectedServiceName(selectedItem.display);
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
          value={initialSelectedItem ? visitQueueEntriesCount : serviceCount}
          headerLabel={`${t('waitingFor', 'Waiting for')}:`}
          service={currentServiceName}
          serviceUuid={currentServiceUuid}
          locationUuid={currentQueueLocation}>
          <Dropdown
            id="inline"
            type="inline"
            label={currentServiceName ?? `${t('all', 'All')}`}
            items={[{ display: `${t('all', 'All')}` }, ...allServices]}
            itemToString={(item) => (item ? item.display : '')}
            onChange={handleServiceChange}
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
