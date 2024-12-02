import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, launchWorkspace, UserAvatarIcon } from '@openmrs/esm-framework';
import type { WardPatientWorkspaceProps } from '../../types';

export default function WardPatientActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton
      getIcon={(props) => <UserAvatarIcon {...props} />}
      label={t('Patient', 'patient')}
      iconDescription={t('Patient', 'patient')}
      handler={() => launchWorkspace<WardPatientWorkspaceProps>('ward-patient-workspace')}
      type={'ward'}
    />
  );
}
