import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, AddIcon, type Workspace2DefinitionProps } from '@openmrs/esm-framework';

function CreateAdmissionRequestActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton2
      icon={(props) => <AddIcon {...props} />}
      label={t('addPatientToWard', 'Add patient to ward')}
      workspaceToLaunch={{
        workspaceName: 'ward-app-patient-search-workspace',
        workspaceProps: {
          workspaceTitle: t('addPatientToQueue', 'Add patient to queue'),
          onPatientSelected(
            patientUuid: string,
            patient: fhir.Patient,
            launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
            closeWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
          ) {
            launchChildWorkspace('create-admission-encounter-workspace', {
              selectedPatientUuid: patient.id,
            });
          },
        },
        windowProps: {
          startVisitWorkspaceName: 'ward-app-start-visit-workspace',
        },
      }}
    />
  );
}

export default CreateAdmissionRequestActionButton;
