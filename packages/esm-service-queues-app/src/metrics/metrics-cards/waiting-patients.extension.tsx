import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { MetricsCard, MetricsCardBody, MetricsCardHeader, MetricsCardItem } from './metrics-card.component';
import { useServiceMetricsCount } from '../metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import { type ConfigObject } from '../../config-schema';
import { useServiceQueuesStore } from '../../store/store';

export default function WaitingPatientsExtension() {
  const { t } = useTranslation();
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const { serviceCount } = useServiceMetricsCount(selectedServiceUuid, selectedQueueLocationUuid);
  const {
    concepts: { defaultStatusConceptUuid },
  } = useConfig<ConfigObject>();

  const { totalCount } = useQueueEntries({
    service: selectedServiceUuid,
    location: selectedQueueLocationUuid,
    isEnded: false,
    status: defaultStatusConceptUuid,
  });

  const waitingCount = selectedServiceUuid ? serviceCount : isNaN(totalCount) ? '--' : totalCount;

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('waiting', 'Waiting')} />
      <MetricsCardBody>
        <MetricsCardItem value={waitingCount} />
      </MetricsCardBody>
    </MetricsCard>
  );
}
