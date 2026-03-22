import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import { formatTime, parseDate, type Encounter, type Obs, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type OrderItem, type Order, type Note, type DiagnosisItem } from '../../types/index';
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
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig<ConfigObject>();

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
      if (encounter.orders) {
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

      // Extract diagnoses and notes from observations
      const processObservations = (observations: Obs[], useObsTime = false) => {
        observations.forEach((obs: Obs) => {
          if (obs?.concept?.uuid === config.concepts.visitDiagnosesConceptUuid) {
            const problemListObs = obs.groupMembers?.find(
              (member) => member.concept?.uuid === config.concepts.problemListConceptUuid,
            );
            const diagnosisValue = problemListObs?.value;
            const diagnosis =
              typeof diagnosisValue === 'object' && diagnosisValue !== null && 'display' in diagnosisValue
                ? diagnosisValue.display
                : String(diagnosisValue || '');

            diagnoses.push({
              diagnosis,
            });
          } else if (config.concepts.generalPatientNoteConceptUuid === obs?.concept?.uuid) {
            notes.push({
              note: String(obs.value || ''),
              provider: {
                name: encounter.encounterProviders.length
                  ? encounter.encounterProviders[0].provider.person.display
                  : '',
                role: encounter.encounterProviders.length ? encounter.encounterProviders[0].encounterRole.display : '',
              },
              time: useObsTime
                ? formatTime(parseDate(obs.obsDatetime))
                : encounter.encounterDatetime
                  ? formatTime(parseDate(encounter.encounterDatetime))
                  : '',
              concept: obs.concept,
            });
          }
        });
      };

      // Process general observations
      if (encounter?.obs) {
        processObservations(encounter.obs);
      }

      // Process Visit Note observations with obs-specific timing
      if (encounter.encounterType?.display === 'Visit Note' && encounter.obs) {
        processObservations(encounter.obs, true);
      }

      vitalsToRetrieve.push(encounter);
    });
    return [medications, notes, diagnoses, vitalsToRetrieve];
  }, [
    config.concepts.generalPatientNoteConceptUuid,
    config.concepts.problemListConceptUuid,
    config.concepts.visitDiagnosesConceptUuid,
    encounters,
  ]);

  const tabsClasses = classNames(styles.verticalTabs, {
    [styles.tabletTabs]: isTablet,
    [styles.desktopTabs]: !isTablet,
  });

  const tabClasses = (index: number) =>
    classNames(styles.tab, styles.bodyLong01, {
      [styles.selectedTab]: selectedTabIndex === index,
    });

  return (
    <div className={styles.wrapper}>
      <div className={tabsClasses}>
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
