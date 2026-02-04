import React, { type ReactNode } from 'react';
import { getPatientName, launchWorkspace2 } from '@openmrs/esm-framework';
import { type WardPatient } from '../types';
import styles from './ward-patient-card.scss';

interface Props {
  children: ReactNode;
  wardPatient: WardPatient;

  /**
   * Related patients that are in the same bed as wardPatient. On transfer or bed swap
   * these related patients have the option to be transferred / swapped together
   */
  relatedTransferPatients?: WardPatient[];
}

const WardPatientCard: React.FC<Props> = ({ children, wardPatient, relatedTransferPatients }) => {
  const { patient } = wardPatient;

  return (
    <div className={styles.wardPatientCard}>
      {children}
      <button
        className={styles.wardPatientCardButton}
        onClick={() => {
          launchWorkspace2(
            'ward-patient-workspace',
            {},
            {},
            {
              wardPatient,
              relatedTransferPatients,
            },
          );
        }}>
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
