import React from 'react';
import styles from './admission-request-card.scss';
import { useParams } from 'react-router-dom';
import { type Patient } from '@openmrs/esm-framework';
import { usePatientCardRows } from '../ward-patient-card/ward-patient-card-row.resources';

interface AdmissionRequestCardProps {
  patient: Patient;
}

const AdmissionRequestCard: React.FC<AdmissionRequestCardProps> = ({ patient }) => {
  const rows = usePatientCardRows();
  return (
    <div className={styles.admissionRequestCard}>
      {rows.map((CardRow, i) => (
        <CardRow key={i} patient={patient} bed={null} visit={null} />
      ))}
    </div>
  );
};

export default AdmissionRequestCard;
