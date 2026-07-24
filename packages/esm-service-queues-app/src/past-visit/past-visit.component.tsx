import React from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListSkeleton } from '@carbon/react';
import { attach, ExtensionSlot, parseDate, formatDatetime } from '@openmrs/esm-framework';
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
  const { visits, isLoading } = usePastVisits(patientUuid, currentVisitUuid);

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
            {visits?.startDatetime
              ? (() => {
                  const parsedDate = parseDate(visits.startDatetime);
                  return parsedDate && !isNaN(parsedDate.getTime()) ? formatDatetime(parsedDate) : '--';
                })()
              : '--'}
          </p>
        </div>
        <ExtensionSlot name={visitSummarySlot} state={{ visit: visits, patientUuid }} />
      </div>
    );
  }
  return <p className={styles.bodyLong01}>{t('noPreviousVisitFound', 'No previous visit found')}</p>;
};

export default PastVisit;
