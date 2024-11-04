import React from 'react';
import type { WardPatientWorkspaceProps } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import PatientBedSwapForm from './assign-bed-form.component';
import styles from './assign-bed-form.scss';

export default function PatientTransferWorkspace(props: WardPatientWorkspaceProps) {
  const { wardPatient } = props;

  return (
    <div className={styles.flexWrapper}>
      <div className={styles.patientWorkspaceBanner}>
        <WardPatientWorkspaceBanner wardPatient={props?.wardPatient} />
      </div>
      <div className={styles.workspaceForm}>{wardPatient && <PatientBedSwapForm {...props} />}</div>
    </div>
  );
}
