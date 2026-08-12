import React from 'react';
import type { WardPatientWorkspaceProps } from '../../types';
import CancelAdmissionRequest from './cancel-admission-request.component';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';

/**
 * This is the workspace that is rendered when clicking on the 'Cancel' button on a AdmissionRequestCard
 * for a patient with a pending admission / transfer request to the current location
 */
const CancelAdmissionRequestWorkspace: React.FC<Workspace2DefinitionProps<WardPatientWorkspaceProps, {}, {}>> = ({
  closeWorkspace,
  workspaceProps: { wardPatient, relatedTransferPatients },
}) => {
  return (
    <CancelAdmissionRequest
      closeWorkspace={closeWorkspace}
      wardPatient={wardPatient}
      relatedTransferPatients={relatedTransferPatients}
    />
  );
};

export default CancelAdmissionRequestWorkspace;
