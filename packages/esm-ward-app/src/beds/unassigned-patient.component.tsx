import React from 'react';
import WardPatientCard from '../ward-patient-card/ward-patient-card';
import styles from './unassigned-patient.scss';
import { type WardPatient } from '../types';

export interface UnassignedPatientProps {
  wardPatient: WardPatient;
}

const UnassignedPatient: React.FC<UnassignedPatientProps> = ({ wardPatient }) => {
  return (
    <div className={styles.unassignedPatient}>
      <div key={'unassigned-bed-pt-' + wardPatient.patient.uuid}>
        <WardPatientCard {...wardPatient} />
      </div>
    </div>
  );
};

export default UnassignedPatient;
