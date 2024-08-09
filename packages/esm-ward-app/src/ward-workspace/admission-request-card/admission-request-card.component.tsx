import React from 'react';
import type { WardPatientCard } from '../../types';
import AdmissionRequestCardActions from './admission-request-card-actions.component';
import AdmissionRequestCardHeader from './admission-request-card-header.component';
import styles from './admission-request-card.scss';

const AdmissionRequestCard: WardPatientCard = (wardPatient) => {
  return (
    <div className={styles.admissionRequestCard}>
      <AdmissionRequestCardHeader {...wardPatient} />
      <AdmissionRequestCardActions {...wardPatient} />
    </div>
  );
};

export default AdmissionRequestCard;
