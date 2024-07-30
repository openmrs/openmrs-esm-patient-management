import React, { useMemo } from 'react';
import styles from './notes.style.scss';
import { type DefaultWorkspaceProps, ExtensionSlot } from '@openmrs/esm-framework';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import { type WardPatientCardProps } from '../../types';

interface WardPatientNotesWorkspaceProps extends DefaultWorkspaceProps, WardPatientCardProps {}

const WardPatientNotesWorkspace = ({
  promptBeforeClosing,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  patient,
  visit,
  bed,
}: WardPatientNotesWorkspaceProps) => {
  const notesFormExtensionState = useMemo(
    () => ({
      patient,
      patientUuid: patient.uuid,
      promptBeforeClosing,
      closeWorkspace,
      closeWorkspaceWithSavedChanges,
    }),
    [patient, closeWorkspace, closeWorkspaceWithSavedChanges, promptBeforeClosing],
  );

  return (
    <div className={styles.workspaceContainer}>
      <WardPatientWorkspaceBanner patient={patient} bed={bed} visit={visit} />
      <ExtensionSlot name="ward-patient-notes-workspace-slot" state={notesFormExtensionState} />
    </div>
  );
};

export default WardPatientNotesWorkspace;
