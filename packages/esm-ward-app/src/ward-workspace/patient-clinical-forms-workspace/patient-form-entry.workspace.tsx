import React, { useMemo } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
// import { useCheckAndPromptForVisit } from '@openmrs/esm-patient-common-lib';
import type { WardPatientWorkspaceProps } from '../../types';

const WardPatientFormEntryWorkspace: React.FC<WardPatientWorkspaceProps> = () => {
  // const { wardPatient, ...restWorkspaceProps } = props;
  // const patientUuid = wardPatient?.patient?.uuid;

  // const { hasCurrentVisit } = useCheckAndPromptForVisit(patientUuid);
  //
  // if (!hasCurrentVisit) {
  //   return null;
  // }

  return <ExtensionSlot name="ward-patient-form-entry-workspace-slot" />;
};

export default WardPatientFormEntryWorkspace;
