import type { DefaultWorkspaceProps, Patient } from '@openmrs/esm-framework';

export interface WardPatientClinicalFormsWorkspaceProps extends DefaultWorkspaceProps {
  patient: Patient;
}

export interface WardPatientFormEntryWorkspaceProps extends DefaultWorkspaceProps {
  patient: Patient;
}
