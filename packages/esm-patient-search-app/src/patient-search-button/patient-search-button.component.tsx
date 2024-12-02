import React, { useCallback, useEffect } from 'react';
import { Button } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type PatientSearchWorkspaceProps } from '../patient-search-workspace/patient-search.workspace';

interface PatientSearchButtonProps {
  buttonText?: string;
  overlayHeader?: string;
  selectPatientAction?: (patientUuid: string) => {};
  searchQueryUpdatedAction?: (query: string) => {};
  buttonProps?: Object;
  isOpen?: boolean;
  searchQuery?: string;
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
  overlayHeader,
  selectPatientAction,
  searchQueryUpdatedAction,
  buttonProps,
  isOpen = false,
  searchQuery = '',
}) => {
  const { t } = useTranslation();

  const launchPatientSearchWorkspace = useCallback(() => {
    const workspaceProps: PatientSearchWorkspaceProps = {
      handleSearchTermUpdated: searchQueryUpdatedAction,
      initialQuery: searchQuery,
      nonNavigationSelectPatientAction: selectPatientAction,
    };
    launchWorkspace('patient-search-workspace', {
      ...workspaceProps,
      workspaceTitle: overlayHeader,
    });
  }, [overlayHeader, searchQuery, searchQueryUpdatedAction, selectPatientAction]);

  useEffect(() => {
    if (isOpen) {
      launchPatientSearchWorkspace();
    }
  }, [isOpen, launchPatientSearchWorkspace]);

  return (
    <Button
      onClick={() => {
        launchPatientSearchWorkspace();
        searchQueryUpdatedAction && searchQueryUpdatedAction('');
      }}
      aria-label="Search Patient Button"
      aria-labelledby="Search Patient Button"
      renderIcon={(props) => <Search size={20} {...props} />}
      {...buttonProps}>
      {buttonText ? buttonText : t('searchPatient', 'Search patient')}
    </Button>
  );
};

export default PatientSearchButton;
