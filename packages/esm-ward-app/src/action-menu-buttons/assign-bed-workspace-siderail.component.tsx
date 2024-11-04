import { ActionMenuButton, HospitalBedIcon, launchWorkspace, useFeatureFlag } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AssignBedSiderailIcon() {
  const { t } = useTranslation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
  const handler = () => {
    launchWorkspace('bed-assignment-workspace');
  };
  return isBedManagementModuleInstalled ? (
    <ActionMenuButton
      getIcon={(props) => <HospitalBedIcon {...props} />}
      label={t('assignBed', 'Assign bed')}
      iconDescription={t('assignBed', 'Assign Bed')}
      handler={handler}
      type="assign-bed-form"
    />
  ) : (
    <></>
  );
}
