import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import { formatTime, parseDate, type Encounter } from '@openmrs/esm-framework';
import { type OrderItem, type Order, type Encounter as ServiceQueuesEncounter } from '../../types/index';
import { useNotesAndDiagnoses } from '../../current-visit/hooks/useNotesAndDiagnoses';
import { useVitalsFromObs } from '../../current-visit/hooks/useVitalsConceptMetadata';
import EncounterList from './encounter-list.component';
import Medications from './medications-list.component';
import Notes from './notes-list.component';
import Vitals from '../../current-visit/visit-details/vitals.component';
import styles from './past-visit-summary.scss';

interface PastVisitSummaryProps {
  encounters: Array<Encounter & { orders?: Array<Order> }>;
  patientUuid: string;
}

enum visitTypes {
  CURRENT = 'currentVisit',
  PAST = 'pastVisit',
}

const PastVisitSummary: React.FC<PastVisitSummaryProps> = ({ encounters, patientUuid }) => {
  const { t } = useTranslation();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const { notes, diagnoses } = useNotesAndDiagnoses(encounters as Array<ServiceQueuesEncounter>);

  const encountersToDisplay = useMemo(
    () =>
      encounters
        ? encounters?.map((encounter: Encounter) => ({
            id: encounter?.uuid,
            datetime: encounter?.encounterDatetime || null,
            encounterType: encounter?.encounterType?.display,
            form: encounter?.form,
            obs: encounter?.obs,
            provider:
              encounter?.encounterProviders?.length > 0
                ? encounter.encounterProviders[0].provider?.person?.display
                : '--',
          }))
        : [],
    [encounters],
  );

  const medications: Array<OrderItem> = useMemo(() => {
    const medications: Array<OrderItem> = [];

    encounters?.forEach((encounter) => {
      if (encounter.orders) {
        medications.push(
          ...encounter.orders.map((order: Order) => ({
            order,
            provider: {
              name: encounter.encounterProviders?.[0]?.provider?.person?.display ?? '',
              role: encounter.encounterProviders?.[0]?.encounterRole?.display ?? '',
            },
            time: encounter.encounterDatetime ? formatTime(parseDate(encounter.encounterDatetime)) : '',
          })),
        );
      }
    });

    return medications;
  }, [encounters]);

  const tabClasses = (index: number) =>
    classNames(styles.tab, styles.bodyLong01, {
      [styles.selectedTab]: selectedTabIndex === index,
    });

  return (
    <div className={styles.wrapper}>
      <Tabs>
        <TabList className={styles.verticalTabList} aria-label="Past visits tabs">
          <Tab className={tabClasses(0)} id="vitals-tab" onClick={() => setSelectedTabIndex(0)}>
            {t('vitals', 'Vitals')}
          </Tab>
          <Tab className={tabClasses(1)} id="notes-tab" onClick={() => setSelectedTabIndex(1)}>
            {t('notes', 'Notes')}
          </Tab>
          <Tab className={tabClasses(2)} id="medications-tab" onClick={() => setSelectedTabIndex(2)}>
            {t('medications', 'Medications')}
          </Tab>
          <Tab className={tabClasses(3)} id="encounters-tab" onClick={() => setSelectedTabIndex(3)}>
            {t('encounters', 'Encounters')}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Vitals vitals={useVitalsFromObs(encounters)} patientUuid={patientUuid} visitType={visitTypes.PAST} />
          </TabPanel>
          <TabPanel>
            <Notes notes={notes} diagnoses={diagnoses} />
          </TabPanel>
          <TabPanel>
            <Medications medications={medications} />
          </TabPanel>
          <TabPanel>
            <EncounterList encounters={encountersToDisplay} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default PastVisitSummary;
