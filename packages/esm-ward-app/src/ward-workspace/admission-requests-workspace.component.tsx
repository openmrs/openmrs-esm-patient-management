import React from 'react';
import styles from './admission-requests-workspace.scss';
import AdmissionRequestCard from './admission-request-card.component';

const AdmissionRequestsWorkspace = () => {
  return (
    <div className={styles.admissionRequestsWorkspace}>
      <AdmissionRequestCard />
    </div>
  );
};

export default AdmissionRequestsWorkspace;
