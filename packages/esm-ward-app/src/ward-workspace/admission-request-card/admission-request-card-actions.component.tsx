import { Button } from '@carbon/react';
import { ArrowRightIcon, launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { WardPatientWorkspaceProps, WardPatientCardType } from '../../types';
import type { AdmitPatientFormWorkspaceProps } from '../admit-patient-form-workspace/types';
import styles from './admission-request-card.scss';

const AdmissionRequestCardActions: WardPatientCardType = (wardPatient) => {
  const { patient, inpatientRequest } = wardPatient;
  const { dispositionType } = inpatientRequest;
  const { t } = useTranslation();
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const launchPatientAdmissionForm = useCallback(
    () => launchWorkspace<AdmitPatientFormWorkspaceProps>('admit-patient-form-workspace', { patient, dispositionType }),
    [],
  );

  const launchPatientTransferForm = useCallback(() => {
    launchWorkspace<WardPatientWorkspaceProps>('patient-transfer-request-workspace', {
      wardPatient,
    });
  }, [wardPatient]);

  return (
    <div className={styles.admissionRequestActionBar}>
      <Button kind="ghost" size={responsiveSize} onClick={launchPatientTransferForm}>
        {t('transferElsewhere', 'Transfer elsewhere')}
      </Button>
      <Button kind="ghost" renderIcon={ArrowRightIcon} size={responsiveSize} onClick={launchPatientAdmissionForm}>
        {t('admitPatient', 'Admit patient')}
      </Button>
    </div>
  );
};

export default AdmissionRequestCardActions;
