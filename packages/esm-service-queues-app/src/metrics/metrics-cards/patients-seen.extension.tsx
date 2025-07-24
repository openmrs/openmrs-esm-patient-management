import React from 'react';
import { useTranslation } from 'react-i18next';
import MetricsCard from './metrics-card.component';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { useActiveVisits } from '../metrics.resource';
import { useSelectedService } from '../../helpers/helpers';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import { type ConfigObject } from '../../config-schema';
import { useUniquePatientsWithAppointmentsCount } from '../../hooks/useUniquePatientsWithAppointmentsCount';

export default function PatientsSeenExtension() {
  const { t } = useTranslation();
  const currentUserSession = useSession();
  const sessionLocation = currentUserSession?.sessionLocation?.uuid;
  const { showPatientSeenMetricsCard } = useConfig<ConfigObject>();
  const currentService = useSelectedService();
  const { activeVisitsCount } = useActiveVisits();
  const { count: todaysAppointmentsCount } = useUniquePatientsWithAppointmentsCount(sessionLocation);

  const unscheduledPatientsCount = Math.max(activeVisitsCount - todaysAppointmentsCount, 0);

  const { queueEntries } = useQueueEntries({
    service: currentService?.serviceUuid,
    isEnded: false,
  });

  const inserviceCount = queueEntries?.filter((entry) => entry.status?.display === 'In Service')?.length || 0;

  return (
    <MetricsCard
      label={t('patients', 'Patients')}
      headerLabel={t('patientsSeen', 'Patients seen')}
      service="waitTime"
      value={inserviceCount ?? '0'}
      inconsultation={inserviceCount}
      unscheduled={unscheduledPatientsCount}
      showPatientSeenMetrics={showPatientSeenMetricsCard}
    />
  );
}
