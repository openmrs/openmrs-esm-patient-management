import { useConfig, useDebounce } from '@openmrs/esm-framework';
import React, { useCallback, useState } from 'react';
import { type PatientSearchConfig } from '../config-schema';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import { PatientSearchContext, type PatientSearchContextProps } from '../patient-search-context';
import AdvancedPatientSearchComponent from '../patient-search-page/advanced-patient-search.component';
import { inferModeFromSearchParams } from '../mpi/utils';
import { useSearchParams } from 'react-router-dom';

export interface PatientSearchWorkspaceProps extends PatientSearchContextProps {
  initialQuery?: string;
  handleSearchTermUpdated?: (value: string) => void;
}

/**
 * The workspace allows other apps to include patient search functionality.
 */
const PatientSearchWorkspace: React.FC<PatientSearchWorkspaceProps> = ({
  initialQuery = '',
  handleSearchTermUpdated,
  nonNavigationSelectPatientAction,
  patientClickSideEffect,
}) => {
  const {
    search: { disableTabletSearchOnKeyUp },
  } = useConfig<PatientSearchConfig>();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const showSearchResults = Boolean(searchTerm?.trim());
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [searchParams] = useSearchParams();

  const handleClearSearchTerm = useCallback(() => setSearchTerm(''), [setSearchTerm]);

  const onSearchTermChange = useCallback((value: string) => {
    setSearchTerm(value);
    handleSearchTermUpdated && handleSearchTermUpdated(value);
  }, []);

  return (
    <PatientSearchContext.Provider value={{ nonNavigationSelectPatientAction, patientClickSideEffect }}>
      <PatientSearchBar
        initialSearchTerm={initialQuery}
        onChange={(value) => !disableTabletSearchOnKeyUp && onSearchTermChange(value)}
        onClear={handleClearSearchTerm}
        onSubmit={onSearchTermChange}
      />
      {showSearchResults && (
        <AdvancedPatientSearchComponent
          query={debouncedSearchTerm}
          inTabletOrOverlay
          searchMode={inferModeFromSearchParams(searchParams)}
        />
      )}
    </PatientSearchContext.Provider>
  );
};

export default PatientSearchWorkspace;
