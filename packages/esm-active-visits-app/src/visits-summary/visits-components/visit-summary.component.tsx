import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs } from '@carbon/react';
import { Order, Encounter, Note, Observation, OrderItem } from '../visit.resource';
import styles from '../visit-detail-overview.scss';
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import { OpenmrsResource, formatTime, parseDate } from '@openmrs/esm-framework';

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
      <p className={styles.productiveHeading01}>{t('diagnoses', 'Diagnoses')}</p>
      <div className={`${styles.caption01} ${styles.diagnosesList}`}>
        {diagnoses.length > 0 ? (
          diagnoses.map((d: DiagnosisItem, ind) => (
            <span
              key={ind}
              className={`${styles.diagnosis} ${
                d.order === 'Primary' ? styles.primaryDiagnose : styles.secondaryDiagnose
              }`}>
              {d.diagnosis}
            </span>
          ))
        ) : (
          <span className={`${styles.bodyLong01} ${styles.text02}`} style={{ marginBottom: '0.5rem' }}>
            {t('noDiagnosesFound', 'No diagnoses found')}
          </span>
        )}
      </div>
      <Tabs className={styles.verticalTabs}>
        <Tab
          className={`${styles.tab} ${styles.bodyLong01} ${tabSelected === 0 && styles.selectedTab}`}
          onClick={() => setSelectedTab(0)}
          id="notes-tab"
          label={t('notes', 'Notes')}>
          <NotesSummary notes={notes} />
        </Tab>
        <Tab
          className={`${styles.tab} ${tabSelected === 1 && styles.selectedTab}`}
          onClick={() => setSelectedTab(1)}
          id="tests-tab"
          label={t('tests', 'Tests')}>
          <TestsSummary patientUuid={patientUuid} encounters={encounters as Array<Encounter>} />
        </Tab>
        <Tab
          className={`${styles.tab} ${tabSelected === 2 && styles.selectedTab}`}
          onClick={() => setSelectedTab(2)}
          id="tab-3"
          label={t('medications', 'Medications')}>
          <MedicationSummary medications={medications} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default VisitSummary;
