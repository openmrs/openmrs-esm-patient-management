import { ActionMenuButton, launchWorkspace, MovementIcon, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PatientTransferSiderailIconProps extends DefaultWorkspaceProps {}

export default function PatientTransferSiderailIcon(additionalProps: PatientTransferSiderailIconProps) {
  const { t } = useTranslation();
  const handler = () => {
    launchWorkspace('patient-transfer-workspace');
  };
  return (
    <ActionMenuButton
      getIcon={(props) => <MovementIcon {...props} />}
      label={t('transfers', 'Transfers')}
      iconDescription={t('transfers', 'Transfers')}
      handler={handler}
      type="transfer-form"
    />
  );
}
