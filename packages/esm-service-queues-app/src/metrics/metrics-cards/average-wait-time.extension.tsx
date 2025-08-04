import React from 'react';
import { useTranslation } from 'react-i18next';
import MetricsCard from './metrics-card.component';
import { useAverageWaitTime } from '../metrics.resource';
import { useServiceQueuesStore } from '../../store/store';

export default function AverageWaitTimeExtension() {
  const { t } = useTranslation();
  const { selectedServiceUuid } = useServiceQueuesStore();
  const { waitTime } = useAverageWaitTime(selectedServiceUuid, '');

  return (
    <MetricsCard
      label={t('minutes', 'Minutes')}
      headerLabel={t('averageWaitTime', 'Average wait time today')}
      service="waitTime"
      value={waitTime ? waitTime.averageWaitTime : '--'}
    />
  );
}
