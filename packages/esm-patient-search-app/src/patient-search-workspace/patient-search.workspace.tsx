import React, { useCallback, useMemo, useState } from 'react';
import { useConfig, useDebounce } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import { PatientSearchContextProvider, type PatientSearchContextProps } from '../patient-search-context';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import AdvancedPatientSearchComponent from '../patient-search-page/advanced-patient-search.component';

export interface PatientSearchWorkspaceProps extends PatientSearchContextProps {
  handleSearchTermUpdated?: (value: string) => void;
  hidePatientSearch?: () => void;
  initialQuery?: string;
  showPatientSearch?: () => void;
}

/**
 * The workspace allows other apps to include patient search functionality.
 */
const PatientSearchWorkspace: React.FC<PatientSearchWorkspaceProps> = ({
  handleReturnToSearchList,
  handleSearchTermUpdated,
  hidePatientSearch,
  initialQuery,
  nonNavigationSelectPatientAction,
  patientClickSideEffect,
  showPatientSearch,
}) => {
  const {
    search: { disableTabletSearchOnKeyUp },
  } = useConfig<PatientSearchConfig>();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const showSearchResults = Boolean(searchTerm?.trim());
  const debouncedSearchTerm = useDebounce(searchTerm);

  const handleClearSearchTerm = useCallback(() => setSearchTerm(''), [setSearchTerm]);

  const onSearchTermChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      handleSearchTermUpdated && handleSearchTermUpdated(value);
    },
    [handleSearchTermUpdated],
  );

  const contextValue = useMemo(
    () => ({
      handleReturnToSearchList,
      hidePatientSearch,
      nonNavigationSelectPatientAction,
      patientClickSideEffect,
      showPatientSearch,
    }),
    [
      handleReturnToSearchList,
      hidePatientSearch,
      nonNavigationSelectPatientAction,
      patientClickSideEffect,
      showPatientSearch,
    ],
  );

  return (
    <PatientSearchContextProvider value={contextValue}>
      <PatientSearchBar
        initialSearchTerm={initialQuery}
        onChange={(value) => !disableTabletSearchOnKeyUp && onSearchTermChange(value)}
        onClear={handleClearSearchTerm}
        onSubmit={onSearchTermChange}
      />
      {showSearchResults && <AdvancedPatientSearchComponent query={debouncedSearchTerm} inTabletOrOverlay />}
    </PatientSearchContextProvider>
  );
};

export default PatientSearchWorkspace;
