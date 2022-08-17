import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import { formatTime, parseDate, useLayoutType, formatDatetime } from '@openmrs/esm-framework';
import { Encounter, OrderItem, Order, Note, DiagnosisItem, Observation } from '../../types/index';
import EncounterList from './encounter-list.component';
import styles from '../past-visit.scss';
import Vitals from '../../current-visit/visit-details/vitals.component';
import { useVitalsFromObs } from '../../current-visit/hooks/useVitalsConceptMetadata';
import Notes from './notes-list.component';
import Medications from './medications-list.component';

interface PastVisitSummaryProps {
  encounters: Array<any>;
  patientUuid: string;
}

enum visitTypes {
  CURRENT = 'currentVisit',
  PAST = 'pastVisit',
}

const PastVisitSummary: React.FC<PastVisitSummaryProps> = ({ encounters, patientUuid }) => {
  const { t } = useTranslation();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const isTablet = useLayoutType() === 'tablet';

  const encountersToDisplay = encounters
    .filter((encounter) => encounter?.encounters?.length)
    .flatMap((visitWithEncounters) => mapEncounters(visitWithEncounters));

  const [medications, notes, diagnoses, vitalsToRetrieve]: [
    Array<OrderItem>,
    Array<Note>,
    Array<DiagnosisItem>,
    Array<Encounter>,
  ] = useMemo(() => {
    // Medication Tab
    const medications: Array<OrderItem> = [];
    const notes: Array<Note> = [];
    const diagnoses: Array<DiagnosisItem> = [];
    const vitalsToRetrieve: Array<Encounter> = [];

    // Iterating through every Encounter
    encounters?.forEach((encounter) => {
      encounter?.encounters?.forEach((val: Encounter) => {
        if (val.orders != undefined) {
          medications.push(
            ...val.orders.map((order: Order) => ({
              order,
              provider: {
                name: val.encounterProviders.length ? val.encounterProviders[0].provider.person.display : '',
                role: val.encounterProviders.length ? val.encounterProviders[0].encounterRole.display : '',
              },
              time: val.encounterDatetime ? formatTime(parseDate(val.encounterDatetime)) : '',
            })),
          );
        }

        // Check for Visit Diagnoses and Notes
        val?.obs?.forEach((obs: Observation) => {
          if (obs?.concept?.display === 'Visit Diagnoses') {
            // Putting all the diagnoses in a single array.
            diagnoses.push({
              diagnosis: obs.groupMembers.find((mem) => mem.concept.display === 'PROBLEM LIST').value.display,
            });
          } else if (obs?.concept?.display === 'General patient note') {
            // Putting all notes in a single array.
            notes.push({
              note: obs.value,
              provider: {
                name: val.encounterProviders.length ? val.encounterProviders[0].provider.person.display : '',
                role: val.encounterProviders.length ? val.encounterProviders[0].encounterRole.display : '',
              },
              time: val.encounterDatetime ? formatTime(parseDate(val.encounterDatetime)) : '',
              concept: obs.concept,
            });
          }
        });

        vitalsToRetrieve.push(val);

        // Iterating through every Encounter
        encounters.forEach((enc: Encounter) => {
          // Check for Visit Diagnoses and Notes
          if (enc.encounterType?.display === 'Visit Note') {
            enc.obs.forEach((obs: Observation) => {
              if (obs.concept && obs.concept.display === 'Visit Diagnoses') {
                // // Putting all the diagnoses in a single array.
                diagnoses.push({
                  diagnosis: obs.groupMembers.find((mem) => mem.concept.display === 'PROBLEM LIST').value.display,
                });
              } else if (obs.concept && obs.concept.display === 'General patient note') {
                // Putting all notes in a single array.
                notes.push({
                  note: obs.value,
                  provider: {
                    name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
                    role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
                  },
                  time: formatTime(parseDate(obs.obsDatetime)),
                  concept: obs.concept,
                });
              }
            });
          }
        });
      });
    });
    return [medications, notes, diagnoses, vitalsToRetrieve];
  }, [encounters]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.visitContainer}>
        <Tabs className={`${styles.verticalTabs} ${isTablet ? styles.tabletTabs : styles.desktopTabs}`}>
          <TabList className={styles.verticalTabList} aria-label="Past visits tabs">
            <Tab
              className={`${styles.tab} ${styles.bodyLong01} ${selectedTabIndex === 0 && styles.selectedTab}`}
              id="vitals-tab"
              onClick={() => setSelectedTabIndex(0)}>
              {t('vitals', 'Vitals')}
            </Tab>
            <Tab
              className={`${styles.tab} ${selectedTabIndex === 1 && styles.selectedTab}`}
              id="notes-tab"
              onClick={() => setSelectedTabIndex(1)}>
              {t('notes', 'Notes')}
            </Tab>
            <Tab
              className={`${styles.tab} ${selectedTabIndex === 2 && styles.selectedTab}`}
              id="medications-tab"
              onClick={() => setSelectedTabIndex(2)}>
              {t('medications', 'Medications')}
            </Tab>
            <Tab
              className={`${styles.tab} ${selectedTabIndex === 3 && styles.selectedTab}`}
              id="encounters-tab"
              onClick={() => setSelectedTabIndex(3)}>
              {t('encounters', 'Encounters')}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Vitals
                vitals={useVitalsFromObs(vitalsToRetrieve)}
                patientUuid={patientUuid}
                visitType={visitTypes.PAST}
              />
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
    </div>
  );
};

export default PastVisitSummary;

export function mapEncounters(encounters) {
  return encounters?.encounters?.map((encounter) => ({
    id: encounter?.uuid,
    datetime: formatDatetime(parseDate(encounter?.encounterDatetime)),
    encounterType: encounter?.encounterType?.display,
    form: encounter?.form,
    obs: encounter?.obs,
    provider:
      encounter?.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
  }));
}
