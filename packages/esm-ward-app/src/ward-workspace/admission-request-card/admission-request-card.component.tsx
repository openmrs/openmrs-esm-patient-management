import React from 'react';
import type { WardPatientCard } from '../../types';
import AdmissionRequestCardActions from './admission-request-card-actions.component';
import AdmissionRequestCardHeader from './admission-request-card-header.component';
import styles from './admission-request-card.scss';

const AdmissionRequestCard: WardPatientCard = ({
  patient,
  inpatientRequest,
}) => {
  const { dispositionEncounter, dispositionType } = inpatientRequest;
  return (
    <div className={styles.admissionRequestCard}>
      <AdmissionRequestCardHeader patient={patient} dispositionEncounter={dispositionEncounter} />
      <AdmissionRequestCardActions
        patient={patient}
        dispositionType={dispositionType}
        dispositionEncounter={dispositionEncounter}
      />
    </div>
  );
};

export default AdmissionRequestCard;
