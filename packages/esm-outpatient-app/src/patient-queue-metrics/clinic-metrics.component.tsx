import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DataTableSkeleton } from 'carbon-components-react';

import { useMetrics, useServiceMetricsCount, useServices } from './queue-metrics.resource';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './clinic-metrics.scss';

function ClinicMetrics() {
  const { t } = useTranslation();
  const { metrics, isLoading } = useMetrics();
  const { services } = useServices();
  const [selectedService, setSelectedService] = useState('Triage');
  const { serviceCount } = useServiceMetricsCount(selectedService);

  const handleServiceCountChange = ({ selectedItem }: { selectedItem: string }) => {
    setSelectedService(selectedItem);
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
          value={metrics ? metrics.scheduled_appointments : 0}
          headerLabel={t('scheduledAppointments', 'Scheduled appts. today')}
        />
        <MetricsCard
          label={t('patients', 'Patients')}
          value={serviceCount}
          headerLabel={t('waitingFor', 'Waiting for:')}>
          <Dropdown
            style={{ marginTop: '1.5rem' }}
            id="inline"
            initialSelectedItem={t('triage', 'Triage')}
            label=""
            type="inline"
            items={[...services]}
            onChange={handleServiceCountChange}
          />
        </MetricsCard>
        <MetricsCard
          label={t('minutes', 'Minutes')}
          value={metrics ? metrics.average_wait_time : 0}
          headerLabel={t('averageWaitTime', 'Average wait time today')}
        />
      </div>
    </>
  );
}

export default ClinicMetrics;
