import React from 'react';
import styles from './admission-request-card.scss';

const AdmissionRequestCard = () => {
  const slots = useSlots();
  return (
    <div className={styles.admissionRequestCardHeader}>
      <div className={styles.patientName}>Name</div>
      <div className={styles.patientGender}>Female</div>
      <div className={styles.patientAge}>28 years</div>
      <div className={styles.time}>18:24</div>
      <div className={styles.city}>Joanne Cantwell</div>
      <div className={styles.ward}>ANC Ward</div>
    </div>
  );
};

export default AdmissionRequestCard;
