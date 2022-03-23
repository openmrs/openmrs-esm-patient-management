import React, { useState, useMemo } from 'react';
import styles from './past-visit.scss';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs } from 'carbon-components-react';
import { formatDate, parseDate, useLayoutType } from '@openmrs/esm-framework';
import { usePastVisits } from './past-visit.resource';

interface PastVisitProps {
  patientUuid: string;
}

const PastVisit: React.FC<PastVisitProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data: pastVisits, isError, isLoading } = usePastVisits(patientUuid);
  const [tabSelected, setSelectedTab] = useState(0);
  return (
    <div>
      <div className={styles.visitType}>
        <span> {pastVisits?.length ? pastVisits[0]?.visitType.display : '--'}</span>
        <p className={styles.date}>{pastVisits?.length ? formatDate(parseDate(pastVisits[0]?.startDatetime)) : '--'}</p>
      </div>
      <div className={styles.visitContainer}>
        <Tabs
          className={`${styles.verticalTabs} ${useLayoutType() === 'tablet' ? styles.tabletTabs : styles.desktopTabs}`}>
          <Tab
            className={`${styles.tab} ${styles.bodyLong01} ${tabSelected === 0 && styles.selectedTab}`}
            id="vitals-tab"
            onClick={() => setSelectedTab(0)}
            label={t('vitals', 'Vitals')}></Tab>

          <Tab
            className={`${styles.tab} ${tabSelected === 1 && styles.selectedTab}`}
            id="notes-tab"
            onClick={() => setSelectedTab(1)}
            label={t('notes', 'Notes')}></Tab>

          <Tab
            className={`${styles.tab} ${tabSelected === 2 && styles.selectedTab}`}
            id="medications-tab"
            onClick={() => setSelectedTab(2)}
            label={t('medications', 'Medications')}></Tab>

          <Tab
            className={`${styles.tab} ${tabSelected === 3 && styles.selectedTab}`}
            id="encounters-tab"
            onClick={() => setSelectedTab(3)}
            label={t('encounters', 'Encounters')}></Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default PastVisit;
