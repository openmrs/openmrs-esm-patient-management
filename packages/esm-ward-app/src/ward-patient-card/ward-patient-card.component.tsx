import { getPatientName, launchWorkspace, useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { WardViewContext, type GenericWardPatientCardType, type WardPatientWorkspaceProps } from '../types';
import styles from './ward-patient-card.scss';

const WardPatientCard: GenericWardPatientCardType = ({ header, rows, wardPatient }) => {
  const { patient } = wardPatient;
  const {WardPatientHeader} = useAppContext<WardViewContext>('ward-view-context') ?? {};

  return (
    <div className={styles.wardPatientCard}>
      {header}
      {rows}
      <button
        className={styles.wardPatientCardButton}
        onClick={() => {
          launchWorkspace<WardPatientWorkspaceProps>('ward-patient-workspace', {
            wardPatient,
            WardPatientHeader,
          });
        }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
