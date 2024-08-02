import type { DefaultWorkspaceProps, Patient } from '@openmrs/esm-framework';
import type { DispositionType } from '../../types';

export interface AdmitPatientFormWorkspaceProps extends DefaultWorkspaceProps {
  patient: Patient;
  dispositionType: DispositionType;
}
