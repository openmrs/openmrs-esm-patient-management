import React from 'react';
import styles from './admitted-patient-details.scss';
import { type Patient } from '@openmrs/esm-framework';

export function getAdmittedPatientBedNo(patient: Patient) {
  return (
    <div className={styles.bedNumberBox}>
      <span className={styles.admittedPatientBedNumber}>{1}</span>
    </div>
  );
}

export function getAdmittedPatientName(patient: Patient) {
  return <div className={styles.admittedPatientName}>Chi Bong Ho</div>;
}

export function getAdmittedPatientAge(patient: Patient) {
  return <div className={styles.admittedPatientField}>31 yrs</div>;
}

export function getAdmittedPatientReason(patient: Patient) {
  return <div className={styles.admittedPatientField}>REASON: Induction of Labour</div>;
}

export function getAdmittedPatientTimeLapse(patient: Patient) {
  return <div className={styles.timeLapsed}>ADMITTED: 30 hours ago</div>;
}

export function getAdmittedPatientCity(patient: Patient) {
  return <div className={styles.admittedPatientCity}>AUSTIN</div>;
}
