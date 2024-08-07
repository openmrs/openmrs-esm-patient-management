import React, { useMemo } from 'react';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import { type WardPatientNotesWorkspaceProps } from './types';
import PatientNotesForm from './form/notes-form.component';
import PatientNotesHistory from './history/notes-container.component';

const WardPatientNotesWorkspace = (props: WardPatientNotesWorkspaceProps) => {
  const { patient, visit, bed, admitted, inpatientAdmission, inpatientRequest, ...restWorkspaceProps } = props;
  const wardPatient = { patient, visit, bed, admitted, inpatientAdmission, inpatientRequest };
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
      <PatientNotesHistory patientUuid={patient?.uuid} />
    </div>
  );
};

export default WardPatientNotesWorkspace;
