import {
  ActionMenuButton,
  getGlobalStore,
  launchWorkspace,
  MovementIcon,
  type DefaultWorkspaceProps,
} from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PatientTransferAndSwapSiderailIconProps extends DefaultWorkspaceProps {}

export default function PatientTransferAndSwapSiderailIcon(additionalProps: PatientTransferAndSwapSiderailIconProps) {
  const { t } = useTranslation();
  const handler = () => {
    launchWorkspace('patient-transfer-swap-workspace');
  };
  return (
    <ActionMenuButton
      getIcon={(props) => <MovementIcon {...props} />}
      label={t('transfers', 'Transfers')}
      iconDescription={t('transfers', 'Transfers')}
      handler={handler}
      type="transfer-swap-bed-form"
    />
  );
}
