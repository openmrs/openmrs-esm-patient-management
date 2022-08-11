import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels, Tag } from '@carbon/react';
import { OpenmrsResource, formatTime, parseDate } from '@openmrs/esm-framework';
import NotesSummary from './notes-summary.component';
import MedicationSummary from './medications-summary.component';
import TestsSummary from './tests-summary.component';
import { Order, Encounter, Note, Observation, OrderItem } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

interface DiagnosisItem {
  diagnosis: string;
  order: string;
}

interface VisitSummaryProps {
  encounters: Array<Encounter | OpenmrsResource>;
  patientUuid: string;
}

const VisitSummary: React.FC<VisitSummaryProps> = ({ encounters, patientUuid }) => {
  const { t } = useTranslation();
  const [tabSelected, setSelectedTab] = useState(0);

  const [diagnoses, notes, medications]: [Array<DiagnosisItem>, Array<Note>, Array<OrderItem>] = useMemo(() => {
    // Medication Tab
    const medications: Array<OrderItem> = [];
    // Diagnoses in a Visit
    const diagnoses: Array<DiagnosisItem> = [];
    // Notes Tab
    const notes: Array<Note> = [];

    // Iterating through every Encounter
    encounters.forEach((enc: Encounter) => {
      // Orders of every encounter put in a single array.
      medications.push(
        ...enc.orders.map((order: Order) => ({
          order,
          provider: {
            name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
            role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
          },
        })),
      );

      // Check for Visit Diagnoses and Notes
      if (enc.encounterType.display === 'Visit Note') {
        enc.obs.forEach((obs: Observation) => {
          if (obs.concept.display === 'Visit Diagnoses') {
            // Putting all the diagnoses in a single array.
            diagnoses.push({
              diagnosis: obs.groupMembers.find((mem) => mem.concept.display === 'PROBLEM LIST').value.display,
              order: obs.groupMembers.find((mem) => mem.concept.display === 'Diagnosis order').value.display,
            });
          } else if (obs.concept.display === 'Text of encounter note') {
            // Putting all notes in a single array.
            notes.push({
              note: obs.value,
              provider: {
                name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
                role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
              },
              time: formatTime(parseDate(obs.obsDatetime)),
            });
          }
        });
      }
    });
    return [diagnoses, notes, medications];
  }, [encounters]);

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.diagnosisLabel}>{t('diagnoses', 'Diagnoses')}</p>

      <div className={styles.diagnosesList}>
        {diagnoses.length > 0 ? (
          diagnoses.map((diagnosis, i) => (
            <Tag key={i} type={diagnosis.order === 'Primary' ? 'blue' : 'red'}>
              {diagnosis.diagnosis}
            </Tag>
          ))
        ) : (
          <p className={`${styles.bodyLong01} ${styles.text02}`} style={{ marginBottom: '0.5rem' }}>
            {t('noDiagnosesFound', 'No diagnoses found')}
          </p>
        )}
      </div>
      <Tabs className={styles.verticalTabs}>
        <TabList aria-label="Visit summary tabs" className={styles.tablist}>
          <Tab className={`${styles.tab} ${styles.bodyLong01}`} onClick={() => setSelectedTab(0)} id="notes-tab">
            {t('notes', 'Notes')}
          </Tab>
          <Tab className={styles.tab} onClick={() => setSelectedTab(1)} id="tests-tab">
            {t('tests', 'Tests')}
          </Tab>
          <Tab className={styles.tab} onClick={() => setSelectedTab(2)} id="tab-3">
            {t('medications', 'Medications')}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <NotesSummary notes={notes} />
          </TabPanel>
          <TabPanel>
            <TestsSummary patientUuid={patientUuid} encounters={encounters as Array<Encounter>} />
          </TabPanel>
          <TabPanel>
            <MedicationSummary medications={medications} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default VisitSummary;
