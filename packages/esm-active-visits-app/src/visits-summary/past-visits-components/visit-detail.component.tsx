import React, { useState, useMemo } from 'react';
import Button from 'carbon-components-react/es/components/Button';
import { useTranslation } from 'react-i18next';
import { Encounter } from '../visit.resource';
import dayjs from 'dayjs';
import { Visit } from '@openmrs/esm-framework';
import styles from '../visit-detail-overview.scss';
import EncounterList from './encounter-list.component';
import VisitSummary from './visit-summary.component';

function formatDateTime(date) {
  return dayjs(date).format('MMM DD, YYYY - hh:mm');
}

interface VisitDetailComponentProps {
  visit: Visit;
  patientUuid: string;
}

const VisitDetailComponent: React.FC<VisitDetailComponentProps> = ({ visit, patientUuid }) => {
  const { t } = useTranslation();
  const [listView, setView] = useState(true);
  const encounters = useMemo(
    () =>
      visit.encounters.map((encounter: Encounter) => ({
        id: encounter.uuid,
        time: dayjs(encounter.encounterDateTime).format('hh:mm'),
        encounterType: encounter.encounterType.display,
        provider: encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].display : '',
        obs: encounter.obs,
      })),
    [visit],
  );

  return (
    <div className={styles.visitsDetailWidgetContainer}>
      <div className={styles.visitsDetailHeaderContainer}>
        <h4 className={styles.productiveHeading02}>
          {visit.visitType.display}
          <br />
          <p className={`${styles.bodyLong01} ${styles.text02}`}>{formatDateTime(visit.startDatetime)}</p>
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
};

export default VisitDetailComponent;
