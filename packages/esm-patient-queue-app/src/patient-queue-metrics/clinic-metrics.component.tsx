import React from 'react';
import MetricsTile from './metrics-card.component';
import styles from './clinic-metrics.scss';
import { useTranslation } from 'react-i18next';
import { useMetrics } from './queue-metrics.resource';
import { Dropdown, DataTableSkeleton } from 'carbon-components-react';

const MetricsCard: React.FC = () => {
  const { t } = useTranslation();
  const { data: metrics, isError, isLoading } = useMetrics();

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
      text: 'Pharamacy',
    },
  ];
  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  // if (isError) {
  //   return <ErrorState error={isError} headerTitle={t('metricsErrorText', 'Queue Metrics Error')} />;
  // }

  return (
    <div className={styles.metricsCardContainer}>
      <MetricsTile
        totalsLabel={t('patients', 'Patients')}
        totalsValue={metrics ? metrics.scheduled_appointments : 0}
        headerLabel={t('scheduledAppointment', 'Scheduled appts. today')}
      />
      <MetricsTile
        totalsLabel={t('patients', 'Patients')}
        totalsValue={metrics ? metrics.patients_waiting_for_service : 0}
        headerLabel={t('waitingFor', 'Waiting for:')}
        childComponent={
          <Dropdown
            style={{ marginTop: '1.5rem' }}
            id="inline"
            label="Triage"
            type="inline"
            items={items}
            itemToString={(item) => (item ? item.text : '')}
          />
        }
      />
      <MetricsTile
        totalsLabel={t('minutes', 'Minutes')}
        totalsValue={metrics ? metrics.avarage_wait_time : 0}
        headerLabel={t('avarageWaitTime', 'Average wait time today')}
      />
    </div>
  );
};

export default MetricsCard;
