import { getPatientName, launchWorkspaceGroup } from '@openmrs/esm-framework';
import { getPatientChartStore } from '@openmrs/esm-patient-common-lib';
import React, { type ReactNode } from 'react';
import { type WardPatient } from '../types';
import styles from './ward-patient-card.scss';

interface Props {
  children: ReactNode;
  wardPatient: WardPatient;
}

const WardPatientCard: React.FC<Props> = ({ children, wardPatient }) => {
  const { patient } = wardPatient;

  return (
    <div className={styles.wardPatientCard}>
      {children}
      <button
        className={styles.wardPatientCardButton}
        onClick={() => {
          launchWorkspaceGroup('ward-patient', {
            state: {
              wardPatient,
              patient,
              patientUuid: patient.uuid,
            },
            onWorkspaceGroupLaunch: () => {
              const store = getPatientChartStore();
              store.setState({
                patientUuid: patient.uuid,
              });
            },
            workspaceToLaunch: {
              name: 'ward-patient-workspace',
            },
            workspaceGroupCleanup: () => {
              const store = getPatientChartStore();
              store.setState({
                patientUuid: undefined,
              });
            },
          });
        }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
