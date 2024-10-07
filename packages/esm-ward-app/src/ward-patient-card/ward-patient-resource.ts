import { launchWorkspace } from '@openmrs/esm-framework';
import { type WardPatient, type WardPatientWorkspaceProps } from '../types';

let wardPatient: WardPatient = null;
export function setWardPatient(currentWardPatient: WardPatient) {
  wardPatient = currentWardPatient;
}

export function launchPatientWorkspace() {
  launchWorkspace<WardPatientWorkspaceProps>('ward-patient-workspace', {
    wardPatient,
  });
}
