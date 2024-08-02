import React, { useMemo } from 'react';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import { type WardPatientNotesWorkspaceProps } from './types';
import PatientNotesForm from './form/notes-form.component';

const WardPatientNotesWorkspace = ({ patient, visit, bed, ...restWorkspaceProps }: WardPatientNotesWorkspaceProps) => {
  const notesFormState = useMemo(
    () => ({
      patientUuid: patient?.uuid,
      ...restWorkspaceProps,
    }),
    [patient, restWorkspaceProps],
  );

  return (
    <div>
      <WardPatientWorkspaceBanner patient={patient} bed={bed} visit={visit} />
      <PatientNotesForm {...notesFormState} />
    </div>
  );
};

export default WardPatientNotesWorkspace;
