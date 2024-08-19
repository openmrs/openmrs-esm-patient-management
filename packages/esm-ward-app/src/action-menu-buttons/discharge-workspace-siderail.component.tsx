import { ActionMenuButton, type DefaultWorkspaceProps, launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Exit } from '@carbon/react/icons';

interface PatientTransferAndSwapSiderailIconProps extends DefaultWorkspaceProps {}

export default function PatientTransferAndSwapSiderailIcon(additionalProps: PatientTransferAndSwapSiderailIconProps) {
  const { t } = useTranslation();
  const handler = () => {
    launchWorkspace('patient-transfer-swap-workspace');
  };
  return (
    <ActionMenuButton
      getIcon={(props) => <Exit {...props} />}
      label={t('transfers', 'Transfers')}
      iconDescription={t('transfers', 'Transfers')}
      handler={handler}
      type="transfer-swap-bed-form"
    />
  );
}
