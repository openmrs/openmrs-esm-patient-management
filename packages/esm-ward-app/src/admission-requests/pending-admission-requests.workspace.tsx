import { DefaultWorkspaceProps } from '@openmrs/esm-framework';
import React from 'react';
import styles from './pending-admission-requests.scss';
import { usePendingAdmissions } from '../hooks/usePendingAdmissions';
import PendingAdmissionPatientCard from './pending-admission-patient-card.component';

/*
Workspace to show pending admission and transfer requests to the current location
*/
const PendingAdmissionRequestsWorkspace: React.FC<DefaultWorkspaceProps> = ({}) => {
  const {patients} = usePendingAdmissions(null);

  return (
    <div className={styles.pendingAdmissionRequestWorkspace}>
      {
        patients.map(patient => <PendingAdmissionPatientCard patient={patient} />)
      }
    </div>
  )
}

export default PendingAdmissionRequestsWorkspace;