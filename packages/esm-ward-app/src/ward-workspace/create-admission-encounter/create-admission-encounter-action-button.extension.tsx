import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, AddIcon, launchWorkspace } from '@openmrs/esm-framework';
import { type CreateAdmissionEncounterWorkspaceProps } from './create-admission-encounter.workspace';

function CreateAdmissionRequestActionButton() {
  const { t } = useTranslation();

  // TODO: this is an attempt to save the previous search term for the
  // "Back to patient search" button, but it doesn't work. See:
  // https://openmrs.atlassian.net/browse/O3-4300
  const [searchTerm, setSearchTerm] = useState<string>('');

  // See PatientSearchWorkspaceProps in patient-search-app
  const workspaceProps = {
    initialQuery: searchTerm,
    nonNavigationSelectPatientAction: async (patientUuid) => {
      launchWorkspace<CreateAdmissionEncounterWorkspaceProps>('create-admission-encounter-workspace', {
        patientUuid,
        handleReturnToSearchList: launchSearchWorkspace,
      });
    },
    handleSearchTermUpdated: (value: string) => {
      setSearchTerm(value);
    },
  };

  const launchSearchWorkspace = () => {
    launchWorkspace('patient-search-workspace', {
      ...workspaceProps,
      workspaceTitle: t('addPatientToWard', 'Add patient to ward'),
    });
  };

  return (
    <ActionMenuButton
      getIcon={(props) => <AddIcon {...props} />}
      label={t('addPatientToWard', 'Add patient to ward')}
      iconDescription={t('addPatientToWard', 'Add patient to ward')}
      handler={launchSearchWorkspace}
      type={'patient-search-workspace'}
    />
  );
}

export default CreateAdmissionRequestActionButton;
