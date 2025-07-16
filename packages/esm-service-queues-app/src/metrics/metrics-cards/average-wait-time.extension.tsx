import React from 'react';
import { useTranslation } from 'react-i18next';
import MetricsCard from './metrics-card.component';
import { useAverageWaitTime } from '../metrics.resource';
import { useSelectedService } from '../../helpers/helpers';

export default function AverageWaitTimeExtension() {
  const { t } = useTranslation();
  const currentService = useSelectedService();
  const { waitTime } = useAverageWaitTime(currentService?.serviceUuid, '');

  return (
    <MetricsCard
      label={t('minutes', 'Minutes')}
      headerLabel={t('averageWaitTime', 'Average wait time today')}
      service="waitTime"
      value={waitTime ? waitTime.averageWaitTime : '--'}
    />
  );
}
