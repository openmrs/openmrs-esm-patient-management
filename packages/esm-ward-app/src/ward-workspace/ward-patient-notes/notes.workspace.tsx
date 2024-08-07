import React, { useMemo } from 'react';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import { type WardPatientNotesWorkspaceProps } from './types';
import PatientNotesForm from './form/notes-form.component';
import PatientNotesHistory from './history/notes-container.component';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';

const WardPatientNotesWorkspace = (props: WardPatientNotesWorkspaceProps) => {
  const {
    patient,
    visit,
    bed,
    admitted,
    encounterAssigningToCurrentInpatientLocation,
    firstAdmissionOrTransferEncounter,
    ...restWorkspaceProps
  } = props;
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();

  const wardPatient = {
    patient,
    visit,
    bed,
    admitted,
    encounterAssigningToCurrentInpatientLocation,
    firstAdmissionOrTransferEncounter,
  };
  const notesFormState = useMemo(
    () => ({
      patientUuid: patient?.uuid,
      emrConfiguration,
      isLoadingEmrConfiguration,
      errorFetchingEmrConfiguration,
      ...restWorkspaceProps,
    }),
    [patient, restWorkspaceProps, errorFetchingEmrConfiguration, emrConfiguration, isLoadingEmrConfiguration],
  );

  return (
    <div>
      <WardPatientWorkspaceBanner {...wardPatient} />
      <PatientNotesForm {...notesFormState} />
      <PatientNotesHistory
        patientUuid={patient?.uuid}
        emrConfiguration={emrConfiguration}
        isLoadingEmrConfiguration={isLoadingEmrConfiguration}
      />
    </div>
  );
};

export default WardPatientNotesWorkspace;
