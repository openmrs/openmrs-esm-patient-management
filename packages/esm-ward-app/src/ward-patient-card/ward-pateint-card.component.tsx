import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import { useParams } from 'react-router-dom';
import { WardPatientStatus, type Bed } from '../types';
import { useCardSlots } from './ward-patient-card.resources';
import styles from "./ward-patient-card.scss";

export interface WardPatientCardProps {
  patient: Patient;
  bed: Bed;
  status: WardPatientStatus;
}
const WardPatientCard: React.FC<WardPatientCardProps> = ({ patient, bed }) => {
  const { locationUuid } = useParams();
  const wardPatientCardSlots = useCardSlots(locationUuid);

  return (
    <div className={styles.wardPatientCard}>
      <div className={styles.wardPatientCardHeader}>
        {wardPatientCardSlots.map((WardPatientCardSlot, i) => (
          <WardPatientCardSlot key={i} patient={patient} bed={bed} />
        ))}
      </div>
    </div>
  );
};

export default WardPatientCard;
