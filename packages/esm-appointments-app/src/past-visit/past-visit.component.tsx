import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListSkeleton, Tab, Tabs } from 'carbon-components-react';
import { formatDate, OpenmrsResource, parseDate, useLayoutType } from '@openmrs/esm-framework';
import { usePastVisits } from './past-visit.resource';
import EncounterList from './encounter-list.component';
import styles from './past-visit.scss';
import { Observation } from '../types';

interface PastVisitProps {
  patientUuid: string;
}

export interface FormattedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
  visitType: string;
  visitUuid: string;
}

const PastVisit: React.FC<PastVisitProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data: pastVisits, isError, isLoading } = usePastVisits(patientUuid);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const isTablet = useLayoutType() === 'tablet';

  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }

  if (pastVisits?.length) {
    const encounters = mapEncounters(pastVisits[0]);

    return (
      <div className={styles.wrapper}>
        <div className={styles.visitType}>
          <span> {pastVisits?.length ? pastVisits[0]?.visitType.display : '--'}</span>
          <p className={styles.date}>
            {pastVisits?.length ? formatDate(parseDate(pastVisits[0]?.startDatetime)) : '--'}
          </p>
        </div>
        <div className={styles.visitContainer}>
          <Tabs className={`${styles.verticalTabs} ${isTablet ? styles.tabletTabs : styles.desktopTabs}`}>
            <Tab
              className={`${styles.tab} ${styles.bodyLong01} ${selectedTabIndex === 0 && styles.selectedTab}`}
              id="vitals-tab"
              onClick={() => setSelectedTabIndex(0)}
              label={t('vitals', 'Vitals')}></Tab>

            <Tab
              className={`${styles.tab} ${selectedTabIndex === 1 && styles.selectedTab}`}
              id="notes-tab"
              onClick={() => setSelectedTabIndex(1)}
              label={t('notes', 'Notes')}></Tab>

            <Tab
              className={`${styles.tab} ${selectedTabIndex === 2 && styles.selectedTab}`}
              id="medications-tab"
              onClick={() => setSelectedTabIndex(2)}
              label={t('medications', 'Medications')}></Tab>

            <Tab
              className={`${styles.tab} ${selectedTabIndex === 3 && styles.selectedTab}`}
              id="encounters-tab"
              onClick={() => setSelectedTabIndex(3)}
              label={t('encounters', 'Encounters')}>
              <EncounterList encounters={encounters} />
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
  return <p className={`${styles.bodyLong01}`}>{t('noPreviousVisitFound', 'No previous visit found')}</p>;
};

export default PastVisit;

export function mapEncounters(visit) {
  return visit?.encounters?.map((encounter) => ({
    id: encounter?.uuid,
    datetime: encounter?.encounterDatetime,
    encounterType: encounter?.encounterType?.display,
    form: encounter?.form,
    obs: encounter?.obs,
    provider:
      encounter?.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
    visitUuid: visit?.visitType.uuid,
    visitType: visit?.visitType?.name,
  }));
}
