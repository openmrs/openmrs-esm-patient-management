import React from 'react';
import { useTranslation } from 'react-i18next';
import { closeWorkspaceGroup2, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type WardPatientWorkspaceProps } from '../../types';
import PatientAdmitOrTransferForm from '../patient-transfer-bed-swap/patient-admit-or-transfer-request-form.component';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './patient-transfer-request.scss';

/**
 * This workspace is launched when the "Transfer elsewhere" / "Admit elsewhere"
 * button on a pending request patient card is clicked on
 */
const PatientTransferRequestWorkspace: React.FC<Workspace2DefinitionProps<WardPatientWorkspaceProps, {}, {}>> = ({
  workspaceProps: { wardPatient },
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTransfer = wardPatient.inpatientRequest.dispositionType == 'TRANSFER';

  return (
    <Workspace2
      title={isTransfer ? t('transferElsewhere', 'Transfer elsewhere') : t('admitElsewhere', 'Admit elsewhere')}>
      <div className={styles.patientTransferRequestWorkspace}>
        <WardPatientWorkspaceBanner {...{ wardPatient }} />
        <PatientAdmitOrTransferForm
          wardPatient={wardPatient}
          onSuccess={async () => {
            await closeWorkspace({ discardUnsavedChanges: true });
            closeWorkspaceGroup2();
          }}
          onCancel={() => closeWorkspace()}
        />
      </div>
    </Workspace2>
  );
};

export default PatientTransferRequestWorkspace;
