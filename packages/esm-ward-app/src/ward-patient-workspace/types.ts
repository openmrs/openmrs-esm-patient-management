import type { DefaultWorkspaceProps, PatientUuid } from '@openmrs/esm-framework';
import type { WardPatient } from '../types';

export interface WardPatientWorkspaceProps extends DefaultWorkspaceProps, WardPatient {
  patientUuid: PatientUuid;
}
