import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import type { WardPatientWorkspaceProps } from '../../types';

const WardPatientClinicalFormsWorkspace: React.FC<WardPatientWorkspaceProps> = (props) => {
  const { wardPatient, ...restWorkspaceProps } = props;
  const patientUuid = wardPatient?.patient?.uuid;

  return (
    <ExtensionSlot
      name="ward-patient-clinical-forms-workspace-slot"
      state={{
        patientUuid,
        ...restWorkspaceProps,
      }}
    />
  );
};

export default WardPatientClinicalFormsWorkspace;
