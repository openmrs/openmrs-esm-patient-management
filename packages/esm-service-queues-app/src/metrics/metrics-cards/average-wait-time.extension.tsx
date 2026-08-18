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

  // With nothing to average the queue module returns null, or 0 / "NaN" from released versions (an
  // empty match set / no matched entry with both timestamps). None of these is a real measurement, so
  // all show "--". Rounding before the check also keeps a sub-minute average on "--".
  const totalMinutes = Math.round(Number(waitTime?.averageWaitTime));
  const hasWaitTime = Number.isFinite(totalMinutes) && totalMinutes > 0;

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('avgWaitTime', 'Avg. wait time')} />
      <MetricsCardBody>
        <MetricsCardItem value={isLoading || error || !hasWaitTime ? '--' : formatWaitTime(totalMinutes)} />
      </MetricsCardBody>
    </MetricsCard>
  );
}

// Formats whole minutes like the table's "Wait time" column (see QueueDuration). Only call with a finite
// number — Intl.DurationFormat rejects NaN.
function formatWaitTime(totalMinutes: number) {
  return formatDuration(
    { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 },
    { style: 'long', minutesDisplay: 'always' },
  );
}
