import React, { useMemo } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import type { WardPatientWorkspaceProps } from '../../types';

const WardPatientClinicalFormsWorkspace: React.FC<WardPatientWorkspaceProps> = (props) => {
  const { wardPatient, ...restWorkspaceProps } = props;
  const patientUuid = wardPatient?.patient?.uuid;

  const clinicalFormsExtensionState = useMemo(
    () => ({
      patientUuid,
      clinicalFormsWorkspaceName: 'ward-patient-clinical-forms-workspace',
      formEntryWorkspaceName: 'ward-patient-form-entry-workspace',
      htmlFormEntryWorkspaceName: 'ward-patient-html-form-entry-workspace',
      ...restWorkspaceProps,
    }),
    [patientUuid, restWorkspaceProps],
  );

  return <ExtensionSlot name="ward-patient-clinical-forms-workspace-slot" state={clinicalFormsExtensionState} />;
};

export default WardPatientClinicalFormsWorkspace;
