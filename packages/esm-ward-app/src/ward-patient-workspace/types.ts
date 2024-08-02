import type { DefaultWorkspaceProps, PatientUuid } from '@openmrs/esm-framework';
import type { WardPatientCardProps } from '../types';

export interface WardPatientWorkspaceProps extends DefaultWorkspaceProps, WardPatientCardProps {
  patientUuid: PatientUuid;
}
