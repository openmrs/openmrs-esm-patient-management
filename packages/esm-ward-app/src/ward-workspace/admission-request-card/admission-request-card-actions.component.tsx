import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { closeWorkspaceGroup2, useLayoutType, useWorkspace2Context } from '@openmrs/esm-framework';
import type { WardPatient } from '../../types';
import AdmitPatientButton from '../admit-patient-button.component';
import styles from './admission-request-card.scss';

interface AdmissionRequestCardActionsProps {
  wardPatient: WardPatient;
  relatedTransferPatients?: WardPatient[];
}

const AdmissionRequestCardActions: React.FC<AdmissionRequestCardActionsProps> = ({
  wardPatient,
  relatedTransferPatients,
}) => {
  const { t } = useTranslation();
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const { closeWorkspace, launchChildWorkspace } = useWorkspace2Context();

  const launchPatientTransferForm = () => {
    launchChildWorkspace('transfer-elsewhere-workspace', { wardPatient, relatedTransferPatients });
  };

  const launchCancelAdmissionForm = () => {
    launchChildWorkspace('cancel-admission-request-workspace', { wardPatient, relatedTransferPatients });
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
        relatedTransferPatients={relatedTransferPatients}
        dispositionType={wardPatient.inpatientRequest.dispositionType}
        onAdmitPatientSuccess={async () => {
          await closeWorkspace({ discardUnsavedChanges: true });
          closeWorkspaceGroup2();
        }}
      />
    </div>
  );
};

export default AdmissionRequestCardActions;
