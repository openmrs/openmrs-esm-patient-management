import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isDesktop, type PatientUuid, useLayoutType } from '@openmrs/esm-framework';
import { usePatientNotes } from '../notes.resource';
import InPatientNote, { InPatientNoteSkeleton } from './note.component';
import { type EmrApiConfigurationResponse } from '../../../types';
import styles from './styles.scss';
import { Dropdown } from '@carbon/react';

interface PatientNotesHistoryProps {
  patientUuid: PatientUuid;
  emrConfiguration: EmrApiConfigurationResponse;
  isLoadingEmrConfiguration: boolean;
}

const PatientNotesHistory: React.FC<PatientNotesHistoryProps> = ({
  patientUuid,
  emrConfiguration,
  isLoadingEmrConfiguration,
}) => {
  const { t } = useTranslation();
  const desktopLayout = isDesktop(useLayoutType());
  const [filter, setFilter] = useState('');
  const { patientNotes, isLoadingPatientNotes } = usePatientNotes(
    patientUuid,
    emrConfiguration?.visitNoteEncounterType?.uuid,
    emrConfiguration?.consultFreeTextCommentsConcept.uuid,
  );

  const handleEncounterTypeChange = ({ selectedItem }) => setFilter(selectedItem);

  const isLoading = isLoadingPatientNotes || isLoadingEmrConfiguration;

  return (
    <div className={styles.notesContainer}>
      <div className={styles.notesContainerHeader}>
        <div className={styles.notesContainerTitle}>History</div>
        <div>
          <Dropdown
            autoAlign
            id="providerFilter"
            initialSelectedItem={t('all', 'All')}
            label=""
            titleText={t('show', 'Show')}
            type="inline"
            items={[t('all', 'All')]}
            onChange={handleEncounterTypeChange}
            size={desktopLayout ? 'sm' : 'lg'}
          />
        </div>
      </div>
      {isLoading ? [1, 2, 3, 4].map((item, index) => <InPatientNoteSkeleton key={index} />) : null}
      {patientNotes.map((patientNote) => (
        <InPatientNote key={patientNote.id} note={patientNote} />
      ))}
    </div>
  );
};

export default PatientNotesHistory;