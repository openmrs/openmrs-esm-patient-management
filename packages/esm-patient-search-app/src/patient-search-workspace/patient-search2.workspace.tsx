import React, { useCallback, useState } from 'react';
import { useConfig, useDebounce, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import { PatientSearchContext2 } from '../patient-search-context';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import AdvancedPatientSearchComponent from '../patient-search-page/advanced-patient-search.component';

export interface PatientSearchWorkspaceProps {
  initialQuery?: string;
  workspaceTitle: string;
  onPatientSelected(
    patientUuid: string,
    patient: fhir.Patient,
    launchChildWorkspace: (workspaceName: string, workspaceProps?: object) => void,
    closeWorkspace: () => void,
  ): void;
}

export interface PatientSearchWorkspaceWindowProps {
  startVisitWorkspaceName: string;
}

/**
 * This v2 workspace allows other apps to include patient search functionality.
 */
const PatientSearchWorkspace2: React.FC<
  Workspace2DefinitionProps<PatientSearchWorkspaceProps, PatientSearchWorkspaceWindowProps, {}>
> = ({
  workspaceProps: { initialQuery = '', onPatientSelected, workspaceTitle },
  windowProps: { startVisitWorkspaceName },
  launchChildWorkspace,
  closeWorkspace,
}) => {
  const {
    search: { disableTabletSearchOnKeyUp },
  } = useConfig<PatientSearchConfig>();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchTerm);
  const showSearchResults = Boolean(debouncedSearchTerm?.trim());

  const handleClearSearchTerm = useCallback(() => setSearchTerm(''), [setSearchTerm]);

  return (
    <Workspace2 title={workspaceTitle}>
      <PatientSearchContext2.Provider
        value={{ onPatientSelected, launchChildWorkspace, closeWorkspace, startVisitWorkspaceName }}>
        <PatientSearchBar
          initialSearchTerm={initialQuery}
          onChange={(value) => !disableTabletSearchOnKeyUp && setSearchTerm(value)}
          onClear={handleClearSearchTerm}
          onSubmit={setSearchTerm}
        />
        {showSearchResults && <AdvancedPatientSearchComponent query={debouncedSearchTerm} inTabletOrOverlay />}
      </PatientSearchContext2.Provider>
    </Workspace2>
  );
};

export default PatientSearchWorkspace2;
