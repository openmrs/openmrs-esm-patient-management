import React from 'react';
import { type WardPatientCardProps } from '../types';
import WardPatientCardBentoBox from './ward-patient-card-bento-box.component';
import styles from './ward-patient-card.scss';

const WardPatientCard: React.FC<WardPatientCardProps> = (props) => {
  // TODO: currently a patient card only has a row of bento-box header.
  // We intend of having other rows to show in the patient card be
  // extensions.
  return (
    <div className={styles.wardPatientCard}>
      <WardPatientCardBentoBox {...props} className={styles.wardPatientCardHeader} />
    </div>
  );
};

export default WardPatientCard;
