import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsCard, MetricsCardHeader, MetricsCardBody, MetricsCardItem } from './metrics-card.component';
import { useActiveVisits } from '../metrics.resource';
import { useServiceQueuesStore } from '../../store/store';

export default function CheckedInPatientsExtension() {
  const { t } = useTranslation();
  const { selectedQueueLocationUuid } = useServiceQueuesStore();
  const { isLoading, activeVisitsCount } = useActiveVisits(selectedQueueLocationUuid);

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('checkedInPatients', 'Checked in patients')} />
      <MetricsCardBody>
        <MetricsCardItem label={t('patients', 'Patients')} value={isLoading ? '--' : activeVisitsCount} />
      </MetricsCardBody>
    </MetricsCard>
  );
}
