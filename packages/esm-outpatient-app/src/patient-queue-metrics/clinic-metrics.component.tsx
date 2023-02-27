import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DataTableSkeleton } from '@carbon/react';
import { useMetrics, useAppointmentMetrics, useServiceMetricsCount, useServices } from './queue-metrics.resource';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './clinic-metrics.scss';
import {
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useSelectedServiceName,
  useSelectedServiceUuid,
  useSelectedQueueLocationUuid,
} from '../helpers/helpers';
import { useVisitQueueEntries } from '../active-visits/active-visits-table.resource';
import { useActiveVisits } from './clinic-metrics.resource';

export interface Service {
  uuid: string;
  display: string;
}

function ClinicMetrics() {
  const { t } = useTranslation();

  const { metrics, isLoading } = useMetrics();
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { allServices } = useServices(currentQueueLocation);
  const currentServiceName = useSelectedServiceName();
  const currentServiceUuid = useSelectedServiceUuid();
  const { serviceCount } = useServiceMetricsCount(currentServiceName, currentQueueLocation);
  const [initialSelectedItem, setInitialSelectItem] = useState(true);
  const { visitQueueEntriesCount } = useVisitQueueEntries(currentServiceName, currentQueueLocation);
  const { activeVisitsCount, isLoading: loading } = useActiveVisits();

  useEffect(() => {
    if (currentServiceName && currentServiceUuid) {
      setInitialSelectItem(false);
    } else if (currentServiceName === t('all', 'All')) {
      setInitialSelectItem(true);
    }
  }, [allServices, currentServiceName, serviceCount, currentServiceUuid, t]);

  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedServiceUuid(selectedItem.uuid);
    updateSelectedServiceName(selectedItem.display);
    setInitialSelectItem(false);
  };

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer}>
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
            label={currentServiceName}
            items={[{ display: `${t('all', 'All')}` }, ...allServices]}
            itemToString={(item) => (item ? item.display : '')}
            onChange={handleServiceChange}
          />
        </MetricsCard>
        <MetricsCard
          label={t('minutes', 'Minutes')}
          value="--"
          headerLabel={t('averageWaitTime', 'Average wait time today')}
          service="waitTime"
        />
      </div>
    </>
  );
}

export default ClinicMetrics;
