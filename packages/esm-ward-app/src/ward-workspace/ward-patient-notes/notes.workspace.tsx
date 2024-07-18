import React, { useMemo } from 'react';
import styles from './notes.style.scss';
import { type DefaultWorkspaceProps, ExtensionSlot } from '@openmrs/esm-framework';
import { getWardStore } from '../../store';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';

const WardPatientNotesWorkspace = ({
  promptBeforeClosing,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  setOnCloseCallback,
}: DefaultWorkspaceProps) => {
  const wardStore = getWardStore();
  const { patient, visit, bed } = wardStore.getState().activeBedSelection;

  setOnCloseCallback(() => {
    wardStore.setState({ activeBedSelection: null });
  });

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
