import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { MetricsCard, MetricsCardBody, MetricsCardHeader, MetricsCardItem } from './metrics-card.component';
import { useServiceMetricsCount } from '../metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import useQueueServices from '../../hooks/useQueueService';
import { type ConfigObject } from '../../config-schema';
import { useServiceQueuesStore } from '../../store/store';
import styles from './metrics-card.scss';

export default function WaitingPatientsExtension() {
  const { t } = useTranslation();
  const { selectedServiceUuid, selectedServiceDisplay, selectedQueueLocationUuid } = useServiceQueuesStore();
  const { services, isLoadingQueueServices } = useQueueServices();
  const { serviceCount } = useServiceMetricsCount(selectedServiceUuid, selectedQueueLocationUuid);
  const {
    concepts: { defaultStatusConceptUuid },
  } = useConfig<ConfigObject>();
  const matchedService = services?.find((service) => service.uuid === selectedServiceUuid);
  const selectedServiceLabel = !selectedServiceUuid
    ? t('all', 'All')
    : (matchedService?.display ?? (isLoadingQueueServices ? selectedServiceDisplay : null) ?? t('all', 'All'));

  const { totalCount, queueEntries } = useQueueEntries({
    service: selectedServiceUuid,
    location: selectedQueueLocationUuid,
    isEnded: false,
    status: defaultStatusConceptUuid,
  });

  const urgentCount = queueEntries.filter((entry) => entry.priority?.display?.toLowerCase() === 'urgent').length;

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('waitingFor', 'Waiting for')}>
        <span className={styles.headerValue}>{selectedServiceLabel}</span>
      </MetricsCardHeader>
      <MetricsCardBody>
        <MetricsCardItem
          label={t('patients', 'Patients')}
          value={!selectedServiceUuid ? (totalCount ?? '--') : serviceCount}
        />
        <MetricsCardItem label={t('urgent', 'Urgent')} value={urgentCount} color="red" small />
      </MetricsCardBody>
    </MetricsCard>
  );
}
