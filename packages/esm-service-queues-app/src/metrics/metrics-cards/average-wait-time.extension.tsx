import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDuration, useConfig } from '@openmrs/esm-framework';
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

  // With nothing to average the queue module returns 0, or "NaN" from older versions that divide by
  // zero. Neither is a real measurement, and a genuine average is never exactly 0, so both show "--".
  const averageWaitTime = Number(waitTime?.averageWaitTime);
  const hasWaitTime = waitTime?.averageWaitTime != null && Number.isFinite(averageWaitTime) && averageWaitTime > 0;

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('avgWaitTime', 'Avg. wait time')} />
      <MetricsCardBody>
        <MetricsCardItem value={isLoading || error || !hasWaitTime ? '--' : formatWaitTimeInMinutes(averageWaitTime)} />
      </MetricsCardBody>
    </MetricsCard>
  );
}

// Formats minutes like the table's "Wait time" column (see QueueDuration). Rounding before splitting
// avoids "3 hours, 60 minutes". Only call with a finite number — Intl.DurationFormat throws on NaN.
function formatWaitTimeInMinutes(minutes: number) {
  const totalMinutes = Math.round(minutes);
  return formatDuration(
    { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 },
    { style: 'long', minutesDisplay: 'always' },
  );
}
