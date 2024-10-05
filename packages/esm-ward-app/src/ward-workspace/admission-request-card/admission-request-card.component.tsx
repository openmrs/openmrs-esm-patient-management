import React from 'react';
import type { WardPatientCardType } from '../../types';
import AdmissionRequestCardActions from './admission-request-card-actions.component';
import AdmissionRequestCardHeader from './admission-request-card-header.component';
import styles from './admission-request-card.scss';

const AdmissionRequestCard: WardPatientCardType = (wardPatient) => {
  return (
    <div className={styles.admissionRequestCard}>
      <AdmissionRequestCardHeader {...wardPatient} />
      <AdmissionRequestCardActions {...wardPatient} />
    </div>
  );
};

export default AdmissionRequestCard;
