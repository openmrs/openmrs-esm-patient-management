import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsCard, MetricsCardBody, MetricsCardHeader, MetricsCardItem } from './metrics-card.component';
import { useAverageWaitTime } from '../metrics.resource';
import { useSelectedService } from '../../helpers/helpers';

export default function AverageWaitTimeExtension() {
  const { t } = useTranslation();
  const currentService = useSelectedService();
  const { waitTime } = useAverageWaitTime(currentService?.serviceUuid, '');

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('averageWaitTime', 'Average wait time today')} />
      <MetricsCardBody>
        <MetricsCardItem label={t('minutes', 'Minutes')} value={waitTime ? waitTime.averageWaitTime : '--'} />
      </MetricsCardBody>
    </MetricsCard>
  );
}
