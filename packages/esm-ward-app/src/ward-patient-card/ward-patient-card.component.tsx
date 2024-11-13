import { getPatientName, launchWorkspace, useAppContext } from '@openmrs/esm-framework';
import React, { type ReactNode } from 'react';
import { type WardViewContext, type WardPatient,type PatientWorkspaceAdditionalProps } from '../types';
import styles from './ward-patient-card.scss';

interface Props {
  children: ReactNode;
  wardPatient: WardPatient;
}

const WardPatientCard: React.FC<Props> = ({ children, wardPatient }) => {
  const { patient } = wardPatient;
  const { WardPatientHeader } = useAppContext<WardViewContext>('ward-view-context') ?? {};

  return (
    <div className={styles.wardPatientCard}>
      {children}
      <button
        className={styles.wardPatientCardButton}
        onClick={() => {
          launchWorkspace<PatientWorkspaceAdditionalProps>('ward-patient-workspace', {
            wardPatient,
            WardPatientHeader
          });
         }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
