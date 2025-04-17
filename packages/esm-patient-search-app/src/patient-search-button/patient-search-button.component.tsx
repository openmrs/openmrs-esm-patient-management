import React, { useCallback, useEffect } from 'react';
import { Button } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { launchWorkspace } from '@openmrs/esm-framework';
import { type PatientSearchWorkspaceProps } from '../patient-search-workspace/patient-search.workspace';

interface PatientSearchButtonProps {
  buttonProps?: Object;
  buttonText?: string;
  handleReturnToSearchList?: () => void;
  hidePatientSearch?: () => void;
  isOpen?: boolean;
  searchQuery?: string;
  searchQueryUpdatedAction?: (query: string) => {};
  selectPatientAction?: (patientUuid: string) => {};
  showPatientSearch?: () => void;
  workspaceTitle?: string;
}

/**
 *
 * This patient search button is an extension that other apps can include
 * to add patient search functionality. It opens the search UI in a workspace.
 *
 * As it is possible to launch the patient search workspace directly with
 * `launchWorkspace('patient-search-workspace', props)`, this button only exists
 * for compatibility and should not be used otherwise.
 *
 * @returns
 */
const PatientSearchButton: React.FC<PatientSearchButtonProps> = ({
  buttonText,
  workspaceTitle,
  selectPatientAction,
  searchQueryUpdatedAction,
  buttonProps,
  isOpen = false,
  searchQuery = '',
  handleReturnToSearchList,
  hidePatientSearch,
  showPatientSearch,
}) => {
  const { t } = useTranslation();

  const launchPatientSearchWorkspace = useCallback(() => {
    const workspaceProps: PatientSearchWorkspaceProps = {
      handleSearchTermUpdated: searchQueryUpdatedAction,
      initialQuery: searchQuery,
      nonNavigationSelectPatientAction: selectPatientAction,
      handleReturnToSearchList,
      showPatientSearch,
      hidePatientSearch,
    };

    launchWorkspace('patient-search-workspace', {
      ...workspaceProps,
      workspaceTitle,
    });
  }, [
    handleReturnToSearchList,
    hidePatientSearch,
    searchQuery,
    searchQueryUpdatedAction,
    selectPatientAction,
    showPatientSearch,
    workspaceTitle,
  ]);

  useEffect(() => {
    if (isOpen) {
      launchPatientSearchWorkspace();
    }
  }, [isOpen, launchPatientSearchWorkspace]);

  return (
    <Button
      aria-label={t('searchPatientButton', 'Search Patient Button')}
      onClick={() => {
        launchPatientSearchWorkspace();
        searchQueryUpdatedAction && searchQueryUpdatedAction('');
      }}
      renderIcon={(props) => <Search size={20} {...props} />}
      {...buttonProps}>
      {buttonText ? buttonText : t('searchPatient', 'Search patient')}
    </Button>
  );
};

export default PatientSearchButton;
