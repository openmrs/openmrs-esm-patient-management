import React from 'react';
import AdmittedPatientHeader from './admitted-patient-header/admitted-patient-header';
import { type Patient } from '@openmrs/esm-framework';
import { type Bed } from '../types';
import styles from './admitted-patient.scss';
import { Tag } from '@carbon/react';

export interface AdmittedPatientProps {
  patients: Patient[];
  bed: Bed | null;
}
const AdmittedPatient: React.FC<AdmittedPatientProps> = ({ patients, bed }) => {
  return (
    <div className={styles.admittedPatients}>
      {patients.map((patient, index: number) => {
        return (
          <div key={patient.uuid}>
            <AdmittedPatientHeader patient={patient} bed={bed} />
            {index != patients.length - 1 && (
              <div className={styles.bedDivider}>
                <div className={styles.line1}></div>
                <Tag>Bed share</Tag>
                <div className={styles.line2}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdmittedPatient;
