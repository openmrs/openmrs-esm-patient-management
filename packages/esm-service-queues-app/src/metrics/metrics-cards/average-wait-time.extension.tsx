import React from 'react';
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
  const { waitTime } = useAverageWaitTime(selectedServiceUuid, selectedQueueLocationUuid, defaultStatusConceptUuid);

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('avgWaitTime', 'Avg. wait time')} />
      <MetricsCardBody>
        <MetricsCardItem
          value={waitTime ? `${Math.round(waitTime.averageWaitTime * 100) / 100} ${t('minsUnit', 'mins')}` : '--'}
        />
      </MetricsCardBody>
    </MetricsCard>
  );
}
