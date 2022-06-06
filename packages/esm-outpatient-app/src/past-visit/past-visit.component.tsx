import React from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListSkeleton } from 'carbon-components-react';
import { parseDate, formatDatetime, OpenmrsResource } from '@openmrs/esm-framework';
import { usePastVisits } from './past-visit.resource';
import styles from './past-visit.scss';
import PastVisitSummary from './past-visit-details/past-visit-summary.component';
import { Observation } from '../types/index';
interface PastVisitProps {
  patientUuid: string;
}

const PastVisit: React.FC<PastVisitProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { visits, isError, isLoading } = usePastVisits(patientUuid);

  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }

  if (visits) {
    return (
      <div className={styles.visitContainer}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h4 className={styles.visitType}>{visits?.visitType?.display}</h4>
            <p className={styles.date}>{formatDatetime(parseDate(visits?.startDatetime))}</p>
          </div>
          <PastVisitSummary encounters={visits.encounters} patientUuid={patientUuid} />
        </div>
      </div>
    );
  }
  return <p className={`${styles.bodyLong01}`}>{t('noPreviousVisitFound', 'No previous visit found')}</p>;
};

export default PastVisit;
