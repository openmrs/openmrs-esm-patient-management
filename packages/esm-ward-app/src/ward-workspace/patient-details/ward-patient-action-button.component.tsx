import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, UserAvatarIcon } from '@openmrs/esm-framework';

export default function WardPatientActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton2
      icon={(props) => <UserAvatarIcon {...props} />}
      label={t('patient', 'Patient')}
      workspaceToLaunch={{
        workspaceName: 'ward-patient-workspace',
      }}
    />
  );
}
