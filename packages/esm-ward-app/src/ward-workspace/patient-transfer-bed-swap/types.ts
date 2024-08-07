import type { DefaultWorkspaceProps, Patient } from '@openmrs/esm-framework';

export interface PatientTransferAndSwapWorkspaceProps extends DefaultWorkspaceProps {
  patient: Patient;
}
