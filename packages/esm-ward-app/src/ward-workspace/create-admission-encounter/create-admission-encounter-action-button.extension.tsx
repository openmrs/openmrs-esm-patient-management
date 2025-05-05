import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, AddIcon, launchWorkspace, useEmrConfiguration } from '@openmrs/esm-framework';
import { type CreateAdmissionEncounterWorkspaceProps } from './create-admission-encounter.workspace';
import useWardLocation from '../../hooks/useWardLocation';
import useLocations from '../../hooks/useLocations';

function CreateAdmissionRequestActionButton() {
  const { t } = useTranslation();
  const { emrConfiguration, isLoadingEmrConfiguration } = useEmrConfiguration();
  const { location, isLoadingLocation } = useWardLocation();
  const filterCriteria: Array<Array<string>> = useMemo(() => {
    const criteria = [];
    if (emrConfiguration) {
      // limit to locations tagged as transfer locations
      criteria.push(['_tag', emrConfiguration.supportsTransferLocationTag.name]);
    }
    return criteria;
  }, [emrConfiguration]);
  const { data: transferLocations, isLoading } = useLocations(filterCriteria, 15, !emrConfiguration);
  const [isValidLocation, setIsValidLocation] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (transferLocations && location?.display) {
      setIsValidLocation(transferLocations.some((loc) => loc.name === location.display));
    } else {
      setIsValidLocation(false); // or true, depending on your default case
    }
  }, [location, transferLocations]);

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

  if (isLoading || isLoadingLocation || isLoadingEmrConfiguration) {
    return null;
  }

  return isValidLocation ? (
    <ActionMenuButton
      getIcon={(props) => <AddIcon {...props} />}
      label={t('addPatientToWard', 'Add patient to ward')}
      iconDescription={t('addPatientToWard', 'Add patient to ward')}
      handler={launchSearchWorkspace}
      type={'patient-search-workspace'}
    />
  ) : null;
}

export default CreateAdmissionRequestActionButton;
