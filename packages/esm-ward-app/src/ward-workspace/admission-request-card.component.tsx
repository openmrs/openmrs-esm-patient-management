import React from 'react';
import styles from './admission-request-card.scss';

import { useParams } from 'react-router-dom';
import { type Patient } from '@openmrs/esm-framework';
import { usePatientCardRows } from '../ward-patient-card/ward-patient-card-row.resources';

interface AdmissionRequestCardProps {
  patient: Patient;
}

const AdmissionRequestCard: React.FC<AdmissionRequestCardProps> = ({ patient }) => {
  const { locationUuid } = useParams();
  const admissionPatientCardSlots = usePatientCardRows(locationUuid);
  return (
    <div className={styles.admissionRequestCardHeader}>
      {admissionPatientCardSlots.map((AdmissionPatientCard, i) => (
        <AdmissionPatientCard key={i} patient={patient} bed={null} />
      ))}
    </div>
  );
};

export default AdmissionRequestCard;
