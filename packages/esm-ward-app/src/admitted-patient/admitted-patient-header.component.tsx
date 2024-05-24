import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import styles from './admitted-patient-header.scss';
import { type Bed } from '../types';
import { type AdmittedPatientHeaderProps } from './admitted-patient.component';



/*
 * Header for a patient admitted to a ward
 */
const AdmittedPatientHeader = ({ bed, patient }: AdmittedPatientHeaderProps) => {
  const { bedNumber } = bed;
  return (
    <div className={styles.admittedPatientHeader}>
      <div className={styles.admittedPatientBedNumber}>{bedNumber.slice(3)}</div>
      <div className={styles.admittedPatientName}> {patient.display}</div>
      <div className={styles.admittedPatientField}>40 yr</div>
      <div className={styles.admittedPatientCity}>Koidu</div>
      <div className={styles.admittedPatientField}>REASON: Low Birth Weight</div>
      <div className={styles.timeLapsed}>ADMITTED: 22 hours ago</div>
    </div>
  );
};

export default AdmittedPatientHeader;
