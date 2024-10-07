import { launchWorkspace } from '@openmrs/esm-framework';
import { type WardPatient, type WardPatientWorkspaceProps } from '../types';

//To keep track of current patient when clicked on ward-patient-card and pass
//it as a prop to launch workspace
let wardPatient: WardPatient = null;
export function setWardPatient(currentWardPatient: WardPatient) {
  wardPatient = currentWardPatient;
}

export function launchPatientWorkspace() {
  launchWorkspace<WardPatientWorkspaceProps>('ward-patient-workspace', {
    wardPatient,
  });
}
