import React from 'react';
import { ActionMenuButton2, UserAvatarIcon } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

export default function AdmissionRequestsActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton2
      icon={(props) => <UserAvatarIcon {...props} />}
      label={t('pendingAdmissions', 'Pending admissions')}
      workspaceToLaunch={{
        workspaceName: 'admission-requests-workspace',
      }}
    />
  );
}
