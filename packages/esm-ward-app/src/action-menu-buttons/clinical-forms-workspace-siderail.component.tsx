import React from 'react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, launchWorkspace, useWorkspaces } from '@openmrs/esm-framework';
import type { WardPatientWorkspaceProps } from '../types';

const ClinicalFormsWorkspaceSideRailIcon: React.FC = () => {
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();

  const formEntryWorkspaces = workspaces.filter((w) => w.name === 'ward-patient-form-entry-workspace');
  const recentlyOpenedForm = formEntryWorkspaces[0];

  const isClinicalFormOpen = formEntryWorkspaces?.length >= 1;

  const launchPatientWorkspaceCb = () => {
    if (isClinicalFormOpen) {
      launchWorkspace('ward-patient-form-entry-workspace', {
        workspaceTitle: recentlyOpenedForm?.additionalProps?.['workspaceTitle'],
      });
    } else {
      launchWorkspace<WardPatientWorkspaceProps>('ward-patient-clinical-forms-workspace');
    }
  };

  return (
    <ActionMenuButton
      getIcon={(props) => <Document {...props} />}
      label={t('clinicalForms', 'Clinical forms')}
      iconDescription={t('clinicalForms', 'Clinical forms')}
      handler={launchPatientWorkspaceCb}
      type="ward-patient-clinical-forms"
    />
  );
};

export default ClinicalFormsWorkspaceSideRailIcon;
