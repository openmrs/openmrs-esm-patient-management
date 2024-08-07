import React, { useMemo } from 'react';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import { type WardPatientNotesWorkspaceProps } from './types';
import PatientNotesForm from './form/notes-form.component';

const WardPatientNotesWorkspace = (props: WardPatientNotesWorkspaceProps) => {
  const { patient, visit, bed, admitted, encounterAssigningToCurrentInpatientLocation, firstAdmissionOrTransferEncounter, ...restWorkspaceProps } = props;
  const wardPatient = { patient, visit, bed, admitted, encounterAssigningToCurrentInpatientLocation, firstAdmissionOrTransferEncounter };
  const notesFormState = useMemo(
    () => ({
      patientUuid: patient?.uuid,
      ...restWorkspaceProps,
    }),
    [patient, restWorkspaceProps],
  );

  return (
    <div>
      <WardPatientWorkspaceBanner {...wardPatient} />
      <PatientNotesForm {...notesFormState} />
    </div>
  );
};

export default WardPatientNotesWorkspace;
