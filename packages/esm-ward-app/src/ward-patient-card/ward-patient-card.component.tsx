import { getPatientName, launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { type GenericWardPatientCardType, type WardPatientWorkspaceProps } from '../types';
import styles from './ward-patient-card.scss';

const WardPatientCard: GenericWardPatientCardType = ({ header, rows, wardPatient }) => {
  const { patient } = wardPatient;

  return (
    <div className={styles.wardPatientCard}>
      {header}
      {rows}
      <button
        className={styles.wardPatientCardButton}
        onClick={() => {
          launchWorkspace<WardPatientWorkspaceProps>('ward-patient-workspace', {
            wardPatient,
          });
        }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
