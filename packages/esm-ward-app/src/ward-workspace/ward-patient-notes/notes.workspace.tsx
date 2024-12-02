import React from 'react';
import { type WardPatientWorkspaceProps } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import PatientNotesForm from './form/notes-form.component';
import PatientNotesHistory from './history/notes-container.component';

const WardPatientNotesWorkspace: React.FC<WardPatientWorkspaceProps> = (props) => {
  const { wardPatient, ...restWorkspaceProps } = props;
  const patientUuid = wardPatient?.patient?.uuid;

  const notesFormState = {
    patientUuid,
    ...restWorkspaceProps,
  };

  return (
    <div>
      <WardPatientWorkspaceBanner {...{ wardPatient }} />
      <PatientNotesForm {...notesFormState} />
      <PatientNotesHistory patientUuid={patientUuid} visitUuid={wardPatient?.visit?.uuid} />
    </div>
  );
};

export default WardPatientNotesWorkspace;
