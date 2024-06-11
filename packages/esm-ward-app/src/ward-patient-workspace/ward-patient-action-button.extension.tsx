import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatarIcon } from '@openmrs/esm-framework';
import { ActionMenuButton, launchWorkspace } from '@openmrs/esm-framework';

export default function WardPatientActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton
      getIcon={(props) => <UserAvatarIcon {...props} />}
      label={t('Patient', 'patient')}
      iconDescription={t('Patient', 'patient')}
      handler={() => launchWorkspace('ward-patient-workspace')}
      type={'ward'}
    />
  );
}
