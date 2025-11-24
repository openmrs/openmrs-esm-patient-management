import React from 'react';
import { type WardPatientWorkspaceProps } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import PatientNotesForm from './form/notes-form.component';
import PatientNotesHistory from './history/notes-container.component';
import { Stack } from '@carbon/react';

const WardPatientNotesWorkspace: React.FC<WardPatientWorkspaceProps> = (props) => {
  const { wardPatient, ...restWorkspaceProps } = props;
  const patientUuid = wardPatient?.patient?.uuid;

  const notesFormState = {
    patientUuid,
    ...restWorkspaceProps,
  };

  return (
    <Stack gap={4}>
      <WardPatientWorkspaceBanner {...{ wardPatient }} />
      <PatientNotesForm {...notesFormState} />
      <PatientNotesHistory patientUuid={patientUuid} visitUuid={wardPatient?.visit?.uuid} {...props} />
    </Stack>
  );
};

export default WardPatientNotesWorkspace;
