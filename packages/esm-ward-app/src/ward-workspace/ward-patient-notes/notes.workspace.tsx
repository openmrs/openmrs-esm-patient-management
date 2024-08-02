import React, { useMemo } from 'react';
import { type DefaultWorkspaceProps, ExtensionSlot } from '@openmrs/esm-framework';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import { type WardPatientCardProps } from '../../types';

export interface WardPatientNotesWorkspaceProps extends DefaultWorkspaceProps, WardPatientCardProps {}

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
      patientUuid: patient?.uuid,
      promptBeforeClosing,
      closeWorkspace,
      closeWorkspaceWithSavedChanges,
    }),
    [patient, closeWorkspace, closeWorkspaceWithSavedChanges, promptBeforeClosing],
  );

  return (
    <div>
      <WardPatientWorkspaceBanner patient={patient} bed={bed} visit={visit} />
      <ExtensionSlot name="ward-patient-notes-workspace-slot" state={notesFormExtensionState} />
    </div>
  );
};

export default WardPatientNotesWorkspace;
