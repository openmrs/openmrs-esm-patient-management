import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { MetricsCard, MetricsCardBody, MetricsCardHeader, MetricsCardItem } from './metrics-card.component';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import { type ConfigObject } from '../../config-schema';
import { useServiceQueuesStore } from '../../store/store';

export default function WaitingPatientsExtension() {
  const { t } = useTranslation();
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const {
    concepts: { waitingStatusConceptUuid },
  } = useConfig<ConfigObject>();

  const { totalCount } = useQueueEntries({
    service: selectedServiceUuid,
    location: selectedQueueLocationUuid,
    isEnded: false,
    status: waitingStatusConceptUuid,
  });

  const waitingCount = isNaN(totalCount) ? '--' : totalCount;

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('waiting', 'Waiting')} />
      <MetricsCardBody>
        <MetricsCardItem value={waitingCount} />
      </MetricsCardBody>
    </MetricsCard>
  );
}
