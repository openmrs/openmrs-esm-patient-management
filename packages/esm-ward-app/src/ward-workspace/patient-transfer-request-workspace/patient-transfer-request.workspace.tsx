import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type WardPatientWorkspaceProps } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import PatientAdmitOrTransferForm from '../patient-transfer-bed-swap/patient-admit-or-transfer-request-form.component';
import styles from './patient-transfer-request.scss';

interface PatientTransferRequestWorkspaceProps extends WardPatientWorkspaceProps {}

/**
 * This workspace is launched when the "Transfer elsewhere" / "Admit elsewhere"
 * button on a pending request patient card is clicked on
 */
const PatientTransferRequestWorkspace: React.FC<PatientTransferRequestWorkspaceProps> = (props) => {
  const { wardPatient } = props;

  return (
    <div className={styles.patientTransferRequestWorkspace}>
      <WardPatientWorkspaceBanner {...{ wardPatient }} />
      <PatientAdmitOrTransferForm {...props} />
    </div>
  );
};

export default PatientTransferRequestWorkspace;
