import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import { formatTime, parseDate, useLayoutType, formatDatetime } from '@openmrs/esm-framework';
import {
  type Encounter,
  type OrderItem,
  type Order,
  type Note,
  type DiagnosisItem,
  type Observation,
} from '../../types/index';
import { useVitalsFromObs } from '../../current-visit/hooks/useVitalsConceptMetadata';
import EncounterList from './encounter-list.component';
import Notes from './notes-list.component';
import Medications from './medications-list.component';
import Vitals from '../../current-visit/visit-details/vitals.component';
import styles from '../past-visit.scss';

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

  const encountersToDisplay = useMemo(
    () =>
      encounters
        ? encounters?.map((encounter: Encounter) => ({
            id: encounter?.uuid,
            datetime: formatDatetime(parseDate(encounter?.encounterDatetime)),
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
      if (encounter.orders != undefined) {
        medications.push(
          ...encounter.orders.map((order: Order) => ({
            order,
            provider: {
              name: encounter.encounterProviders.length ? encounter.encounterProviders[0].provider.person.display : '',
              role: encounter.encounterProviders.length ? encounter.encounterProviders[0].encounterRole.display : '',
            },
            time: encounter.encounterDatetime ? formatTime(parseDate(encounter.encounterDatetime)) : '',
          })),
        );
      }

      // Check for Visit Diagnoses and Notes
      encounter?.obs?.forEach((obs: Observation) => {
        if (obs?.concept?.display === 'Visit Diagnoses') {
          // Putting all the diagnoses in a single array.
          diagnoses.push({
            diagnosis: obs.groupMembers.find((mem) => mem.concept.display === 'PROBLEM LIST')?.value.display,
          });
        } else if (obs?.concept?.display === 'General patient note') {
          // Putting all notes in a single array.
          notes.push({
            note: obs.value,
            provider: {
              name: encounter.encounterProviders.length ? encounter.encounterProviders[0].provider.person.display : '',
              role: encounter.encounterProviders.length ? encounter.encounterProviders[0].encounterRole.display : '',
            },
            time: encounter.encounterDatetime ? formatTime(parseDate(encounter.encounterDatetime)) : '',
            concept: obs.concept,
          });
        }
      });

      vitalsToRetrieve.push(encounter);

      // Check for Visit Diagnoses and Notes
      if (encounter.encounterType?.display === 'Visit Note') {
        encounter.obs.forEach((obs: Observation) => {
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
                name: encounter.encounterProviders.length
                  ? encounter.encounterProviders[0].provider.person.display
                  : '',
                role: encounter.encounterProviders.length ? encounter.encounterProviders[0].encounterRole.display : '',
              },
              time: formatTime(parseDate(obs.obsDatetime)),
              concept: obs.concept,
            });
          }
        });
      }
    });
    return [medications, notes, diagnoses, vitalsToRetrieve];
  }, [encounters]);

  const tabsClasses = classNames(styles.verticalTabs, {
    [styles.tabletTabs]: isTablet,
    [styles.desktopTabs]: !isTablet,
  });

  const tabClasses = (index) =>
    classNames(styles.tab, styles.bodyLong01, {
      [styles.selectedTab]: selectedTabIndex === index,
    });

  return (
    <div className={styles.wrapper}>
      <div className={styles.visitContainer}>
        <Tabs className={tabsClasses}>
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
