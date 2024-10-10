import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatarIcon } from '@openmrs/esm-framework';
import { ActionMenuButton, launchWorkspace } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '../../ward-patient-card/ward-patient-resource';

export default function WardPatientActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton
      getIcon={(props) => <UserAvatarIcon {...props} />}
      label={t('Patient', 'patient')}
      iconDescription={t('Patient', 'patient')}
      handler={() => launchPatientWorkspace()}
      type={'ward'}
    />
  );
}
