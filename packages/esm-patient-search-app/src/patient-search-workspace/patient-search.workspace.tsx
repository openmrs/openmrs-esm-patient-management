import React, { useCallback, useMemo, useState } from 'react';
import { useConfig, useDebounce } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import { PatientSearchContextProvider, type PatientSearchContextProps } from '../patient-search-context';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import AdvancedPatientSearchComponent from '../patient-search-page/advanced-patient-search.component';

export interface PatientSearchWorkspaceProps extends PatientSearchContextProps {
  initialQuery?: string;
}

/**
 * Renders the patient search bar and results inside PatientSearchOverlay.
 */
const PatientSearchWorkspace: React.FC<PatientSearchWorkspaceProps> = ({
  initialQuery,
  nonNavigationSelectPatientAction,
  patientClickSideEffect,
}) => {
  const {
    search: { disableTabletSearchOnKeyUp },
  } = useConfig<PatientSearchConfig>();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const showSearchResults = Boolean(searchTerm?.trim());
  const debouncedSearchTerm = useDebounce(searchTerm);

  const handleClearSearchTerm = useCallback(() => setSearchTerm(''), [setSearchTerm]);

  const onSearchTermChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const contextValue: PatientSearchContextProps = useMemo(
    () => ({
      nonNavigationSelectPatientAction,
      patientClickSideEffect,
    }),
    [nonNavigationSelectPatientAction, patientClickSideEffect],
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
