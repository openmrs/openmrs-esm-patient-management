import React from 'react';
import type { WardPatientWorkspaceProps } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import PatientTransferForm from './patient-transfer-request-form.component';
import styles from './patient-transfer.scss';

export default function PatientTransferWorkspace(props: WardPatientWorkspaceProps) {
  const { wardPatient } = props;

  return (
    <div className={styles.flexWrapper}>
      <div className={styles.patientWorkspaceBanner}>
        <WardPatientWorkspaceBanner wardPatient={wardPatient} />
      </div>
      <div className={styles.workspaceForm}>{wardPatient && <PatientTransferForm {...props} />}</div>
    </div>
  );
}
