import React from 'react';
import { ActionMenuButton2, useConfig, useSession } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Exit } from '@carbon/react/icons';
import { type DischargeWorkspaceSiderailConfig } from './discharge-workspace-siderail-config-schema';

export default function PatientDischargeSideRailIcon() {
  const { t } = useTranslation();
  const { sessionLocation } = useSession();
  const { onlyShowDischargeForLocations } = useConfig<DischargeWorkspaceSiderailConfig>();

  if (onlyShowDischargeForLocations.length === 0 || onlyShowDischargeForLocations.includes(sessionLocation?.uuid)) {
    return (
      <ActionMenuButton2
        icon={(props) => <Exit {...props} />}
        label={t('discharge', 'Discharge')}
        workspaceToLaunch={{
          workspaceName: 'patient-discharge-workspace',
        }}
      />
    );
  } else {
    return null;
  }
}
