import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsCard, MetricsCardHeader, MetricsCardBody, MetricsCardItem } from './metrics-card.component';
import { useActiveVisits } from '../metrics.resource';

export default function CheckedInPatientsExtension() {
  const { t } = useTranslation();
  const { isLoading, activeVisitsCount } = useActiveVisits();

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('checkedInPatients', 'Checked in patients')} />
      <MetricsCardBody>
        <MetricsCardItem label={t('patients', 'Patients')} value={isLoading ? '--' : activeVisitsCount} />
      </MetricsCardBody>
    </MetricsCard>
  );
}
