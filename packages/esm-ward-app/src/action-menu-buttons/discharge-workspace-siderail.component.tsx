import { ActionMenuButton2, launchWorkspace2 } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Exit } from '@carbon/react/icons';

export default function PatientDischargeSideRailIcon() {
  const { t } = useTranslation();
  const handler = () => {
    launchWorkspace2('patient-discharge-workspace');
  };
  return (
    <ActionMenuButton2
      icon={(props) => <Exit {...props} />}
      label={t('discharge', 'Discharge')}
      workspaceToLaunch={{
        workspaceName: 'patient-discharge-workspace',
      }}
    />
  );
}
