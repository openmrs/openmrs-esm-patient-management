import React from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListSkeleton } from '@carbon/react';
import { parseDate, formatDatetime, useConfig, VisitSummary } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { usePastVisits } from './past-visit.resource';
import styles from './past-visit.scss';

interface PastVisitProps {
  patientUuid: string;
  currentVisitUuid?: string;
}

const PastVisit: React.FC<PastVisitProps> = ({ patientUuid, currentVisitUuid }) => {
  const { t } = useTranslation();
  const { notesConceptUuids, drugOrderTypeUUID, disableEmptyTabs } = useConfig<ConfigObject>();
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
        <VisitSummary
          visit={visits}
          patientUuid={patientUuid}
          notesConceptUuids={notesConceptUuids}
          drugOrderTypeUUID={drugOrderTypeUUID}
          disableEmptyTabs={disableEmptyTabs}
        />
      </div>
    );
  }
  return <p className={styles.bodyLong01}>{t('noPreviousVisitFound', 'No previous visit found')}</p>;
};

export default PastVisit;
