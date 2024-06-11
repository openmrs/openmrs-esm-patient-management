import React from 'react';
import { type WardPatientCardProps } from '../types';
import WardPatientCardRow from './ward-patient-card-row.component';
import styles from './ward-patient-card.scss';

const WardPatientCard: React.FC<WardPatientCardProps> = (props) => {
  return (
    <div className={styles.wardPatientCard}>
      <WardPatientCardRow {...props} className={styles.wardPatientCardHeader} />
    </div>
  );
};

export default WardPatientCard;
