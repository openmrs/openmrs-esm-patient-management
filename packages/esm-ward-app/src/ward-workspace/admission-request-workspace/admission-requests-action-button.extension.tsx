import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, launchWorkspace, UserAvatarIcon } from '@openmrs/esm-framework';
import { type AdmissionRequestsWorkspaceContextProps } from './admission-requests-context';

export default function AdmissionRequestsActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton
      getIcon={(props) => <UserAvatarIcon {...props} />}
      handler={() => launchWorkspace<AdmissionRequestsWorkspaceContextProps>('admission-requests-workspace')}
      iconDescription={t('pendingAdmissions', 'Pending admissions')}
      label={t('pendingAdmissions', 'Pending admissions')}
      type={'pending-admission-requests'}
    />
  );
}
