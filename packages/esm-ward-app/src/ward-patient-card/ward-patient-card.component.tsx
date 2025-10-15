import React, { type ReactNode } from 'react';
import { getPatientName, launchWorkspaceGroup } from '@openmrs/esm-framework';
import { getPatientChartStore } from '@openmrs/esm-patient-common-lib';
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
          launchWorkspaceGroup('ward-patient', {
            state: {
              wardPatient,
              patient,
              patientUuid: patient.uuid,
              relatedTransferPatients,
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
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
