import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, DataTableSkeleton } from 'carbon-components-react';
import { useMetrics } from './queue-metrics.resource';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './clinic-metrics.scss';

const ClinicMetrics: React.FC = () => {
  const { t } = useTranslation();
  const { metrics, isError, isLoading } = useMetrics();

  const items = [
    {
      id: 'option-1',
      text: 'Triage',
    },
    {
      id: 'option-2',
      text: 'Adult return',
    },
    {
      id: 'option-3',
      text: 'Pharmacy',
    },
  ];

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <MetricsHeader />
      <div className={styles.clinicMetricsContainer}>
        <MetricsCard
          label={t('patients', 'Patients')}
          value={metrics ? metrics.scheduled_appointments : 0}
          headerLabel={t('scheduledAppointments', 'Scheduled appts. today')}
        />
        <MetricsCard
          label={t('patients', 'Patients')}
          value={metrics ? metrics.patients_waiting_for_service : 0}
          headerLabel={t('waitingFor', 'Waiting for:')}>
          <Dropdown
            style={{ marginTop: '1.5rem' }}
            id="inline"
            label={t('triage', 'Triage')}
            type="inline"
            items={items}
            itemToString={(item) => (item ? item.text : '')}
          />
        </MetricsCard>
        <MetricsCard
          label={t('minutes', 'Minutes')}
          value={metrics ? metrics.avarage_wait_time : 0}
          headerLabel={t('avarageWaitTime', 'Average wait time today')}
        />
      </div>
    </>
  );
};

export default ClinicMetrics;
