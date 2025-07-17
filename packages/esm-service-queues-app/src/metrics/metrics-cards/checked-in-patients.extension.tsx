import React from 'react';
import { useTranslation } from 'react-i18next';
import MetricsCard from './metrics-card.component';
import { useActiveVisits } from '../metrics.resource';

export default function CheckedInPatientsExtension() {
  const { t } = useTranslation();
  const { isLoading, activeVisitsCount } = useActiveVisits();

  return (
    <MetricsCard
      headerLabel={t('checkedInPatients', 'Checked in patients')}
      label={t('patients', 'Patients')}
      service="scheduled"
      value={isLoading ? '--' : activeVisitsCount}
    />
  );
}
