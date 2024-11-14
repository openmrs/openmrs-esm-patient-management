import { Button } from '@carbon/react';
import { launchWorkspace, useAppContext, useLayoutType } from '@openmrs/esm-framework';
import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import type { WardPatientCardType, WardPatientWorkspaceProps, WardViewContext } from '../../types';
import { useAdmitPatient } from '../../ward.resource';
import { AdmissionRequestsWorkspaceContext } from '../admission-request-workspace/admission-requests.workspace';
import AdmissionPatientButton from '../admit-patient-button.component';
import styles from './admission-request-card.scss';

const AdmissionRequestCardActions: WardPatientCardType = ({ wardPatient }) => {
  const { t } = useTranslation();
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const { WardPatientHeader } = useAppContext<WardViewContext>('ward-view-context') ?? {};

  const launchPatientTransferForm = useCallback(() => {
    launchWorkspace<WardPatientWorkspaceProps>('patient-transfer-request-workspace', {
      wardPatient,
      WardPatientHeader,
    });
  }, [wardPatient, WardPatientHeader]);

  const launchCancelAdmissionForm = () => {
    launchWorkspace<WardPatientWorkspaceProps>('cancel-admission-request-workspace', {
      wardPatient,
      WardPatientHeader,
    });
  };

  const { closeWorkspaceWithSavedChanges } = useContext(AdmissionRequestsWorkspaceContext);

  return (
    <div className={styles.admissionRequestActionBar}>
      <Button kind="ghost" size={responsiveSize} onClick={launchPatientTransferForm}>
        {t('transferElsewhere', 'Transfer elsewhere')}
      </Button>
      <Button kind="ghost" size={responsiveSize} onClick={launchCancelAdmissionForm}>
        {t('cancel', 'Cancel')}
      </Button>
      <AdmissionPatientButton
        wardPatient={wardPatient}
        onAdmitPatientSuccess={() => closeWorkspaceWithSavedChanges()}
      />
    </div>
  );
};

export default AdmissionRequestCardActions;
