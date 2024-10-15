import { type DefaultWorkspaceProps, launchWorkspace } from '@openmrs/esm-framework';
import { type WardPatientWorkspaceProps } from '../types';

type PatientWorkspaceAdditionalProps = Omit<WardPatientWorkspaceProps, keyof DefaultWorkspaceProps>;

// workspaces launched from workspace action menu buttons sometimes lose
// access to their props. This serves as a workaround.
// See: https://openmrs.atlassian.net/browse/O3-4004
let props: PatientWorkspaceAdditionalProps = null;
export function setPatientWorkspaceProps(newProps: PatientWorkspaceAdditionalProps) {
  props = newProps;
}

export function launchPatientWorkspace() {
  launchWorkspace<WardPatientWorkspaceProps>('ward-patient-workspace', props);
}
