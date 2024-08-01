import React from 'react';
import styles from './admission-request-card.scss';
import type { InpatientRequest } from '../../types';
import AdmissionRequestCardHeader from './admission-request-card-header.component';
import AdmissionRequestCardActions from './admission-request-card-actions.component';

interface AdmissionRequestCardProps extends InpatientRequest {}

const AdmissionRequestCard: React.FC<AdmissionRequestCardProps> = ({
  patient,
  dispositionEncounter,
  dispositionType,
}) => {
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
