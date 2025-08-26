import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsCard, MetricsCardBody, MetricsCardHeader, MetricsCardItem } from './metrics-card.component';
import { useAverageWaitTime } from '../metrics.resource';
import { useServiceQueuesStore } from '../../store/store';

export default function AverageWaitTimeExtension() {
  const { t } = useTranslation();
  const { selectedServiceUuid } = useServiceQueuesStore();
  const { waitTime } = useAverageWaitTime(selectedServiceUuid, '');

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('averageWaitTime', 'Average wait time today')} />
      <MetricsCardBody>
        <MetricsCardItem label={t('minutes', 'Minutes')} value={waitTime ? waitTime.averageWaitTime : '--'} />
      </MetricsCardBody>
    </MetricsCard>
  );
}
