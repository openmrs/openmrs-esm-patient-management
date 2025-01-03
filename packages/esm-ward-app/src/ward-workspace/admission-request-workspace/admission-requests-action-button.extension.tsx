import { ActionMenuButton, launchWorkspace, UserAvatarIcon } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type AdmissionRequestsWorkspaceProps } from './admission-requests.workspace';

export default function AdmissionRequestsActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton
      getIcon={(props) => <UserAvatarIcon {...props} />}
      label={t('pendingAdmissions', 'Pending admissions')}
      iconDescription={t('pendingAdmissions', 'Pending admissions')}
      handler={() => launchWorkspace<AdmissionRequestsWorkspaceProps>('admission-requests-workspace')}
      type={'pending-admission-requests'}
    />
  );
}
