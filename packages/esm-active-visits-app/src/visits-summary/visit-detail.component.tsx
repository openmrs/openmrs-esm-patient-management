import React, { useState, useMemo } from 'react';
import { Button, DataTableSkeleton } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { Encounter, useVisit } from './visit.resource';
import styles from './visit-detail-overview.scss';
import EncounterList from './visits-components/encounter-list.component';
import VisitSummary from './visits-components/visit-summary.component';
import { formatTime, formatDatetime, parseDate } from '@openmrs/esm-framework';

interface VisitDetailComponentProps {
  visitUuid: string;
  patientUuid: string;
}

const VisitDetailComponent: React.FC<VisitDetailComponentProps> = ({ visitUuid, patientUuid }) => {
  const { t } = useTranslation();
  const [listView, setView] = useState(true);
  const { visit, isError, isLoading, isValidating } = useVisit(visitUuid);

  const encounters = useMemo(
    () =>
      visit
        ? visit?.encounters?.map((encounter: Encounter) => ({
            id: encounter.uuid,
            time: formatTime(parseDate(encounter.encounterDateTime)),
            encounterType: encounter.encounterType.display,
            provider: encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].display : '',
            obs: encounter.obs,
          }))
        : [],
    [visit],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (visit) {
    return (
      <div className={styles.visitsDetailWidgetContainer}>
        <div className={styles.visitsDetailHeaderContainer}>
          <h4 className={styles.productiveHeading02}>
            {visit?.visitType?.display}
            <br />
            <p className={`${styles.bodyLong01} ${styles.text02}`}>{formatDatetime(parseDate(visit?.startDatetime))}</p>
          </h4>
          <div className={styles.toggleButtons}>
            <Button
              className={`${styles.toggle} ${listView ? styles.toggleActive : ''}`}
              size="small"
              kind="ghost"
              onClick={() => setView(true)}>
              {t('allEncounters', 'All Encounters')}
            </Button>
            <Button
              className={`${styles.toggle} ${!listView ? styles.toggleActive : ''}`}
              size="small"
              kind="ghost"
              onClick={() => setView(false)}>
              {t('visitSummary', 'Visit Summary')}
            </Button>
          </div>
        </div>
        {listView && visit?.encounters && <EncounterList visitUuid={visit.uuid} encounters={encounters} />}
        {!listView && <VisitSummary encounters={visit.encounters} patientUuid={patientUuid} />}
      </div>
    );
  } else {
    return null;
  }
};

export default VisitDetailComponent;
