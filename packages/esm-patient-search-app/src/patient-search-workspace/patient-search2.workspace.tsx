import React, { useCallback, useState } from 'react';
import { useConfig, useDebounce, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
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
 * PatientSearchWorkspace2 is the modern (V2) workspace for patient search.
 *
 * It allows other apps (like Ward, Appointments, Service Queues) to embed the search
 * functionality into their own slide-out or child workspaces using `launchChildWorkspace`.
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
      <PatientSearchBar
        initialSearchTerm={initialQuery}
        onChange={(value) => !disableTabletSearchOnKeyUp && setSearchTerm(value)}
        onClear={handleClearSearchTerm}
        onSubmit={setSearchTerm}
      />
      {showSearchResults && (
        <AdvancedPatientSearchComponent
          query={debouncedSearchTerm}
          inTabletOrOverlay
          onPatientSelected={onPatientSelected}
          launchChildWorkspace={launchChildWorkspace}
          closeWorkspace={closeWorkspace}
          startVisitWorkspaceName={startVisitWorkspaceName}
        />
      )}
    </Workspace2>
  );
};

export default PatientSearchWorkspace2;
