import React, { useCallback } from 'react';
import styles from './admission-request-card.scss';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowRightIcon, launchWorkspace, useLayoutType, type Patient } from '@openmrs/esm-framework';
import type { DispositionType, Encounter } from '../../types';
import type { AdmitPatientFormWorkspaceProps } from '../admit-patient-form-workspace/types';

interface AdmissionRequestCardActionsProps {
  patient: Patient;
  dispositionType: DispositionType;
  dispositionEncounter: Encounter;
}

const AdmissionRequestCardActions: React.FC<AdmissionRequestCardActionsProps> = ({ patient, dispositionType }) => {
  const { t } = useTranslation();
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const launchPatientAdmissionForm = useCallback(
    () => launchWorkspace<AdmitPatientFormWorkspaceProps>('admit-patient-form-workspace', { patient, dispositionType }),
    [],
  );
  return (
    <div className={styles.admissionRequestActionBar}>
      <Button kind="ghost" size={responsiveSize}>
        {t('transferElsewhere', 'Transfer elsewhere')}
      </Button>
      <Button kind="ghost" renderIcon={ArrowRightIcon} size={responsiveSize} onClick={launchPatientAdmissionForm}>
        {t('admitPatient', 'Admit patient')}
      </Button>
    </div>
  );
};

export default AdmissionRequestCardActions;
