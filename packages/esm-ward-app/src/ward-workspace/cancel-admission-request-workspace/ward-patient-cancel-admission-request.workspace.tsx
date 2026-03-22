import React from 'react';
import type { WardPatientWorkspaceDefinition } from '../../types';
import CancelAdmissionRequest from './cancel-admission-request.component';

/**
 * This is the workspace that is rendered when clicking on the 'X' button on a Patient Card
 * for a patient with a pending transfer request to a different location
 */
const WardPatientCancelAdmissionRequestWorkspace: React.FC<WardPatientWorkspaceDefinition> = ({
  closeWorkspace,
  groupProps: { wardPatient },
}) => {
  return <CancelAdmissionRequest closeWorkspace={closeWorkspace} wardPatient={wardPatient} />;
};

export default WardPatientCancelAdmissionRequestWorkspace;
