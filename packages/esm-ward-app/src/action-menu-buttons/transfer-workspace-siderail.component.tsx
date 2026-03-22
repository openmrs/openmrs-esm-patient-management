import { ActionMenuButton2, MovementIcon } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PatientTransferAndSwapSiderailIcon() {
  const { t } = useTranslation();
  return (
    <ActionMenuButton2
      icon={(props) => <MovementIcon {...props} />}
      label={t('transfers', 'Transfers')}
      workspaceToLaunch={{
        workspaceName: 'ward-patient-transfer-swap-workspace',
      }}
    />
  );
}
