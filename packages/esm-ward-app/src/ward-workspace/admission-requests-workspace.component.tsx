import React from 'react';
import styles from './admission-requests-workspace.scss';
import AdmissionRequestCard from './admission-request-card.component';
import { type InpatientRequest } from '../types';

interface AdmissionRequestsWorkspaceProps {
  admissionRequests: InpatientRequest[];
}
const AdmissionRequestsWorkspace: React.FC<AdmissionRequestsWorkspaceProps> = ({ admissionRequests }) => {
  return (
    <div className={styles.admissionRequestsWorkspaceContainer}>
      <div className={styles.admissionRequestsWorkspace}>
        {admissionRequests.map((admissionRequest) => (
          <AdmissionRequestCard patient={admissionRequest.patient} />
        ))}
      </div>
    </div>
  );
};

export default AdmissionRequestsWorkspace;
