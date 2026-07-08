import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { MetricsCard, MetricsCardBody, MetricsCardHeader, MetricsCardItem } from './metrics-card.component';
import { useAverageWaitTime } from '../metrics.resource';
import { useServiceQueuesStore } from '../../store/store';
import { type ConfigObject } from '../../config-schema';

export default function AverageWaitTimeExtension() {
  const { t } = useTranslation();
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const {
    concepts: { defaultStatusConceptUuid },
  } = useConfig<ConfigObject>();
  const { waitTime, isLoading, error } = useAverageWaitTime(
    selectedServiceUuid,
    selectedQueueLocationUuid,
    defaultStatusConceptUuid,
  );

  useEffect(() => {
    if (error) {
      console.error('Failed to load the average wait time metric: ', error);
    }
  }, [error]);

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('avgWaitTime', 'Avg. wait time')} />
      <MetricsCardBody>
        <MetricsCardItem
          value={
            isLoading || error || !waitTime
              ? '--'
              : `${Math.round(waitTime.averageWaitTime * 100) / 100} ${t('minsUnit', 'mins')}`
          }
        />
      </MetricsCardBody>
    </MetricsCard>
  );
}
