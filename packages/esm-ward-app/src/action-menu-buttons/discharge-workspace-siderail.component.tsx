import React from 'react';
import { ActionMenuButton2 } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Exit } from '@carbon/react/icons';

export default function PatientDischargeSideRailIcon() {
  const { t } = useTranslation();
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
