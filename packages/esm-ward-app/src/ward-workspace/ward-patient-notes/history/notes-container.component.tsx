import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isDesktop, type PatientUuid, useLayoutType } from '@openmrs/esm-framework';
import { usePatientNotes } from '../notes.resource';
import InPatientNote, { InPatientNoteSkeleton } from './note.component';
import { type EmrApiConfigurationResponse } from '../../../types';
import styles from './styles.scss';
import { Dropdown, InlineNotification } from '@carbon/react';

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
  const { patientNotes, isLoadingPatientNotes, errorFetchingPatientNotes } = usePatientNotes(
    patientUuid,
    emrConfiguration?.visitNoteEncounterType?.uuid,
    emrConfiguration?.consultFreeTextCommentsConcept.uuid,
  );

  const handleEncounterTypeChange = ({ selectedItem }) => setFilter(selectedItem);

  const isLoading = isLoadingPatientNotes || isLoadingEmrConfiguration;

  if (!isLoading && patientNotes.length === 0 && !errorFetchingPatientNotes) return null;

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
      {errorFetchingPatientNotes && (
        <InlineNotification
          kind="error"
          title={t('patientNotesDidntLoad', "Patient notes didn't load")}
          subtitle={t(
            'fetchingPatientNotesFailed',
            'Fetching patient notes failed. Try refreshing the page or contact your system administrator.',
          )}
          lowContrast
          hideCloseButton
        />
      )}
    </div>
  );
};

export default PatientNotesHistory;
