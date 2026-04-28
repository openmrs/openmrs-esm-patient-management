import React from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListSkeleton } from '@carbon/react';
import { parseDate, formatDatetime } from '@openmrs/esm-framework';
import { usePastVisits } from './past-visit.resource';
import PastVisitSummary from './past-visit-details/past-visit-summary.component';
import styles from './past-visit.scss';

interface PastVisitProps {
  patientUuid: string;
}

const PastVisit: React.FC<PastVisitProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { visits, isLoading } = usePastVisits(patientUuid);

  if (isLoading) {
    return <StructuredListSkeleton />;
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
        <PastVisitSummary encounters={visits.encounters} patientUuid={patientUuid} />
      </div>
    );
  }
  return <p className={styles.bodyLong01}>{t('noPreviousVisitFound', 'No previous visit found')}</p>;
};

export default PastVisit;
