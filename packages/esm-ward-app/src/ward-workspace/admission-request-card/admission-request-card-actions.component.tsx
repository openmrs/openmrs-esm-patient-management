import { Button } from '@carbon/react';
import { launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import type { WardPatientCardType, WardPatientWorkspaceProps } from '../../types';
import { AdmissionRequestsWorkspaceContext } from '../admission-request-workspace/admission-requests.workspace';
import AdmitPatientButton from '../admit-patient-button.component';
import styles from './admission-request-card.scss';

const AdmissionRequestCardActions: WardPatientCardType = ({ wardPatient }) => {
  const { t } = useTranslation();
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const { closeWorkspaceWithSavedChanges } = useContext(AdmissionRequestsWorkspaceContext);

  const launchPatientTransferForm = () => {
    launchWorkspace<WardPatientWorkspaceProps>('patient-transfer-request-workspace', {
      wardPatient,
    });
  };

  const launchCancelAdmissionForm = () => {
    launchWorkspace<WardPatientWorkspaceProps>('cancel-admission-request-workspace', {
      wardPatient,
    });
  };

  const isTransfer = wardPatient.inpatientRequest.dispositionType == 'TRANSFER';

  return (
    <div className={styles.admissionRequestActionBar}>
      <Button kind="ghost" size={responsiveSize} onClick={launchPatientTransferForm}>
        {isTransfer ? t('transferElsewhere', 'Transfer elsewhere') : t('admitElsewhere', 'Admit elsewhere')}
      </Button>
      <Button kind="ghost" size={responsiveSize} onClick={launchCancelAdmissionForm}>
        {t('cancel', 'Cancel')}
      </Button>
      <AdmitPatientButton
        wardPatient={wardPatient}
        dispositionType={wardPatient.inpatientRequest.dispositionType}
        onAdmitPatientSuccess={() => closeWorkspaceWithSavedChanges()}
      />
    </div>
  );
};

export default AdmissionRequestCardActions;
