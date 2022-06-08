import React, { useMemo } from 'react';
import { Tag, DataTableSkeleton } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import styles from './current-visit.scss';
import CurrentVisitDetails from './visit-details/current-visit-details.component';
import { useVisit } from './current-visit.resource';

interface CurrentVisitProps {
  patientUuid: string;
  visitUuid: string;
}

const CurrentVisit: React.FC<CurrentVisitProps> = ({ patientUuid, visitUuid }) => {
  const { t } = useTranslation();
  const { visit, isError, isLoading } = useVisit(visitUuid);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (visit) {
    return (
      <div className={styles.wrapper}>
        <div>
          <p className={styles.heading}>{visit?.visitType?.display}</p>
          <div className={styles.subHeading}>
            {t('scheduledToday', 'Scheduled for today')} <Tag type="blue"> {t('onTime', 'On time')}</Tag>
          </div>
        </div>

        <div className={styles.visitContainer}>
          <CurrentVisitDetails encounters={visit.encounters} patientUuid={patientUuid} />
        </div>
      </div>
    );
  }
};

export default CurrentVisit;
