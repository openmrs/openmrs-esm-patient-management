import React from 'react';
import styles from './admission-request-card-actions.scss';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowRightIcon, launchWorkspace, useLayoutType, type Patient } from '@openmrs/esm-framework';
import type { DispositionType, Encounter } from '../../types';
import { ButtonSet } from '@carbon/react';

interface AdmissionRequestCardActionsProps {
  patient: Patient;
  dispositionEncounter: Encounter;
}

const AdmissionRequestCardActions: React.FC<AdmissionRequestCardActionsProps> = ({ patient }) => {
  const { t } = useTranslation();
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  return (
    <div className={styles.admissionRequestActionBar}>
      <Button kind="ghost" size={responsiveSize}>
        {t('transferElsewhere', 'Transfer elsewhere')}
      </Button>
      <Button
        kind="ghost"
        renderIcon={ArrowRightIcon}
        size={responsiveSize}
        onClick={() => launchWorkspace('admit-patient-form-workspace', { patient })}>
        {t('admitPatient', 'Admit patient')}
      </Button>
    </div>
  );
};

export default AdmissionRequestCardActions;
