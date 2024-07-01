import React from 'react';
import { useParams } from 'react-router-dom';
import { type WardPatientCardProps } from '../types';
import { usePatientCardRows } from './ward-patient-card-row.resources';
import styles from './ward-patient-card.scss';

const WardPatientCard: React.FC<WardPatientCardProps> = (props) => {
  const { locationUuid } = useParams();
  const patientCardRows = usePatientCardRows(locationUuid);

  return (
    <div className={styles.wardPatientCard}>
      {patientCardRows.map((WardPatientCardRow, i) => (
        <WardPatientCardRow key={i} {...props} />
      ))}
    </div>
  );
};

export default WardPatientCard;
