import { getPatientName, useAppContext, launchWorkspaceGroup } from '@openmrs/esm-framework';
import React, { type ReactNode } from 'react';
import { type WardViewContext, type WardPatient } from '../types';
import styles from './ward-patient-card.scss';
import { getPatientChartStore } from '@openmrs/esm-patient-common-lib';

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
          launchWorkspaceGroup('ward-patient', {
            state: {
              wardPatient,
              WardPatientHeader,
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
