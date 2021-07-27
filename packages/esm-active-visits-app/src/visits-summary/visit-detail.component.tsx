import React, { useEffect, useState, useMemo } from 'react';
import Button from 'carbon-components-react/es/components/Button';
import { useTranslation } from 'react-i18next';
import { Encounter, fetchVisit } from './visit.resource';
import dayjs from 'dayjs';
import { Visit, createErrorHandler } from '@openmrs/esm-framework';
import styles from './visit-detail-overview.scss';
import EncounterList from './visits-components/encounter-list.component';
import VisitSummary from './visits-components/visit-summary.component';
import { DataTableSkeleton } from 'carbon-components-react';

function formatDateTime(date) {
  return dayjs(date).format('MMM DD, YYYY - hh:mm');
}

interface VisitDetailComponentProps {
  visitUuid: string;
  patientUuid: string;
}

const VisitDetailComponent: React.FC<VisitDetailComponentProps> = ({ visitUuid, patientUuid }) => {
  const { t } = useTranslation();
  const [listView, setView] = useState(true);
  const [visit, setVisit] = useState<Visit>(null);
  const encounters = useMemo(
    () =>
      visit
        ? visit.encounters.map((encounter: Encounter) => ({
            id: encounter.uuid,
            time: dayjs(encounter.encounterDateTime).format('hh:mm'),
            encounterType: encounter.encounterType.display,
            provider: encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].display : '',
            obs: encounter.obs,
          }))
        : [],
    [visit],
  );

  useEffect(() => {
    const abortController = new AbortController();
    const sub = fetchVisit(visitUuid, abortController).subscribe(({ data }) => {
      setVisit(data);
    }, createErrorHandler());
    return () => {
      abortController.abort();
      sub.unsubscribe();
    };
  }, []);

  return visit ? (
    <div className={styles.visitsDetailWidgetContainer}>
      <div className={styles.visitsDetailHeaderContainer}>
        <h4 className={styles.productiveHeading02}>
          {visit?.visitType?.display}
          <br />
          <p className={`${styles.bodyLong01} ${styles.text02}`}>{formatDateTime(visit?.startDatetime)}</p>
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
  ) : (
    <DataTableSkeleton />
  );
};

export default VisitDetailComponent;
