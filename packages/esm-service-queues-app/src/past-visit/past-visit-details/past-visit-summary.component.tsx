import React, { useCallback, useState, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import {
  ExtensionSlot,
  formatTime,
  launchWorkspace2,
  parseDate,
  useConfig,
  usePatient,
  type Encounter,
  type Obs,
  type Visit,
} from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type OrderItem, type Order, type Note, type DiagnosisItem } from '../../types/index';
import EncounterList from './encounter-list.component';
import Medications from './medications-list.component';
import Notes from './notes-list.component';
import styles from './past-visit-summary.scss';

interface PastVisitSummaryProps {
  encounters: Array<Encounter & { orders?: Array<Order> }>;
  patientUuid: string;
  visit?: Visit;
}

const PastVisitSummary: React.FC<PastVisitSummaryProps> = ({ encounters, patientUuid, visit }) => {
  const { t } = useTranslation();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const config = useConfig<ConfigObject>();
  const { patient } = usePatient(patientUuid);

  const launchCustomVitalsForm = useCallback(() => {
    launchWorkspace2('service-queues-vitals-form-workspace', {
      patientUuid,
      patient,
      visitContext: visit,
    });
  }, [patient, patientUuid, visit]);

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

  const [medications, notes, diagnoses]: [Array<OrderItem>, Array<Note>, Array<DiagnosisItem>] = useMemo(() => {
    const medications: Array<OrderItem> = [];
    const notes: Array<Note> = [];
    const diagnoses: Array<DiagnosisItem> = [];

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
    });
    return [medications, notes, diagnoses];
  }, [
    config.concepts.generalPatientNoteConceptUuid,
    config.concepts.problemListConceptUuid,
    config.concepts.visitDiagnosesConceptUuid,
    encounters,
  ]);

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
            <ExtensionSlot
              name="service-queues-patient-vitals-slot"
              state={{ patient, patientUuid, visitContext: visit, launchCustomVitalsForm }}
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
  );
};

export default PastVisitSummary;
