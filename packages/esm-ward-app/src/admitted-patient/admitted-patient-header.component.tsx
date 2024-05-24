import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import styles from './admitted-patient.scss';
import { type Bed } from '../types';

interface AdmittedPatientHeaderProps {
  bed: Bed;
  patient: Patient;
}

/*
 * Header for a patient admitted to a ward
 */
const AdmittedPatientHeader = ({ bed, patient }: AdmittedPatientHeaderProps) => {
  const { bedNumber } = bed;
  return (
    <div className={styles.admittedPatientHeader}>
      <div className={styles.admittedPatientBedNumber}>{bedNumber}</div>
      <div className={styles.admittedPatientName}> {patient.display}</div>
      <div className={styles.admittedPatientField}>40 yr</div>
      <div className={styles.admittedPatientField}>REASON: Low Birth Weight</div>
    </div>
  );
};

export default AdmittedPatientHeader;
