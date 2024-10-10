import { getPatientName, useAppContext } from '@openmrs/esm-framework';
import React, { type ReactNode } from 'react';
import { type WardViewContext, type WardPatient } from '../types';
import styles from './ward-patient-card.scss';
import { launchPatientWorkspace, setPatientWorkspaceProps } from './ward-patient-resource';

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
          setPatientWorkspaceProps({
            wardPatient,
            WardPatientHeader,
          });
          launchPatientWorkspace();
        }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
