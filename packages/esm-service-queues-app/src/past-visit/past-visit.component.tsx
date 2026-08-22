import React from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListSkeleton } from '@carbon/react';
import { attach, ExtensionSlot, parseDate, formatDatetime, usePatient } from '@openmrs/esm-framework';
import { getEditEncounterHandler } from '../edit-encounter';
import { usePastVisits } from './past-visit.resource';
import styles from './past-visit.scss';

const visitSummarySlot = 'service-queues-past-visit-summary-slot';
attach(visitSummarySlot, 'visit-summary');

interface PastVisitProps {
  patientUuid: string;
  currentVisitUuid?: string;
}

const PastVisit: React.FC<PastVisitProps> = ({ patientUuid, currentVisitUuid }) => {
  const { t } = useTranslation();
  const { visits, isLoading, mutate } = usePastVisits(patientUuid, currentVisitUuid);
  const { patient } = usePatient(patientUuid);

  if (isLoading) {
    return (
      <div role="progressbar">
        <StructuredListSkeleton />
      </div>
    );
  }

  if (visits) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h4 className={styles.visitType}>{visits?.visitType?.display}</h4>
          <p className={styles.date}>
            {visits?.startDatetime ? formatDatetime(parseDate(visits.startDatetime)) : '--'}
          </p>
        </div>
        <ExtensionSlot
          name={visitSummarySlot}
          state={{
            visit: visits,
            patientUuid,
            onEditEncounter: getEditEncounterHandler({ patient, patientUuid, visit: visits, mutateVisit: mutate }),
          }}
        />
      </div>
    );
  }
  return <p className={styles.bodyLong01}>{t('noPreviousVisitFound', 'No previous visit found')}</p>;
};

export default PastVisit;
