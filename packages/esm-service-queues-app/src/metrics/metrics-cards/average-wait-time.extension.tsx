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
    concepts: { waitingStatusConceptUuid },
  } = useConfig<ConfigObject>();
  const { waitTime, isLoading, error } = useAverageWaitTime(
    selectedServiceUuid,
    selectedQueueLocationUuid,
    waitingStatusConceptUuid,
  );

  useEffect(() => {
    if (error) {
      console.error('Failed to load the average wait time metric: ', error);
    }
  }, [error]);

  // The queue module divides by zero when no matching entry has an `endedAt`, yielding "NaN" or null.
  const averageWaitTime = Number(waitTime?.averageWaitTime);
  const hasWaitTime = waitTime?.averageWaitTime != null && Number.isFinite(averageWaitTime);

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('avgWaitTime', 'Avg. wait time')} />
      <MetricsCardBody>
        <MetricsCardItem
          value={
            isLoading || error || !hasWaitTime
              ? '--'
              : `${Math.round(averageWaitTime * 100) / 100} ${t('minsUnit', 'mins')}`
          }
        />
      </MetricsCardBody>
    </MetricsCard>
  );
}
