import React from 'react';
import { Movement } from '@carbon/react/icons';
import styles from './admission-requests.scss';
import { launchWorkspace } from '@openmrs/esm-framework';

const AdmissionRequests = () => {
  return (
    <div className={styles.admissionRequestsContainer}>
      <Movement className={styles.movementIcon} size="24" />
      <span className={styles.content}>3 admission requests</span>
      <button className={styles.manageButton} onClick={() => launchWorkspace('admission-requests-cards')}>
        Manage
      </button>
    </div>
  );
};

export default AdmissionRequests;
