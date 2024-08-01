import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import { usePatientCardRows } from '../ward-patient-card/ward-patient-card-row.resources';
import styles from './admission-request-card.scss';

interface AdmissionRequestCardProps {
  patient: Patient;
}

const AdmissionRequestCard: React.FC<AdmissionRequestCardProps> = ({ patient }) => {
  const rows = usePatientCardRows();
  return (
    <div className={styles.admissionRequestCard}>
      {rows.map((CardRow, i) => (
        <CardRow
          key={i}
          patient={patient}
          admitted={false}
          bed={null}
          visit={null}
          firstAdmissionOrTransferEncounter={null} // TODO: populate this after O3-3704 is done
          encounterAssigningToCurrentInpatientLocation={null}
        />
      ))}
    </div>
  );
};

export default AdmissionRequestCard;
