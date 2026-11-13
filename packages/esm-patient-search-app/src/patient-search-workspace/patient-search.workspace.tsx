import React, { useCallback, useMemo, useState } from 'react';
import { useConfig, useDebounce } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import {
  launchStartVisitWorkspaceOutsideWorkspace,
  PatientSearchContext2,
  type PatientSearchContext2Props,
  type PatientSelectionCallback,
} from '../patient-search-context';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import AdvancedPatientSearchComponent from '../patient-search-page/advanced-patient-search.component';

export interface PatientSearchWorkspaceProps {
  initialQuery?: string;
  /** Called just before following a result's link to the patient chart. */
  patientClickSideEffect?: PatientSelectionCallback;
}

/**
 * Renders the patient search bar and results inside PatientSearchOverlay.
 */
const PatientSearchWorkspace: React.FC<PatientSearchWorkspaceProps> = ({ initialQuery, patientClickSideEffect }) => {
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

  const contextValue: PatientSearchContext2Props = useMemo(
    () => ({
      launchStartVisitWorkspace: launchStartVisitWorkspaceOutsideWorkspace,
      onBeforeNavigateToPatient: patientClickSideEffect,
    }),
    [patientClickSideEffect],
  );

  return (
    <PatientSearchContext2.Provider value={contextValue}>
      <PatientSearchBar
        initialSearchTerm={initialQuery}
        onChange={(value) => !disableTabletSearchOnKeyUp && onSearchTermChange(value)}
        onClear={handleClearSearchTerm}
        onSubmit={onSearchTermChange}
      />
      {showSearchResults && <AdvancedPatientSearchComponent query={debouncedSearchTerm} inTabletOrOverlay />}
    </PatientSearchContext2.Provider>
  );
};

export default PatientSearchWorkspace;
