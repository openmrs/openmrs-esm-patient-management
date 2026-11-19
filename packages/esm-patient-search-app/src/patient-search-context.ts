import { createContext, useContext } from 'react';
import { launchWorkspace2, type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';

export interface SelectPatientButtonConfig {
  /**
   * The text shown on the select patient button.
   */
  text: string;
  /**
   * When true, the button is disabled for patients without an active visit. A start visit
   * button is rendered alongside it so the user can start a visit first.
   */
  requiresActiveVisit?: boolean;
}

/**
 * A callback invoked with a patient picked from the search results.
 */
export type PatientSelectionCallback = (patientUuid: string, patient: fhir.Patient) => void;

/**
 * Launches the start visit workspace, in whichever way suits where the caller is mounted.
 */
export type LaunchStartVisitWorkspace = (workspaceProps?: object) => Promise<void>;

/**
 * For search results that are not mounted inside a workspace (the search page and the tablet overlay),
 * where there is no parent workspace to launch a child of. The start visit workspace is hosted in the
 * search app's own workspace group, so that it never opens (or closes) another app's workspace group.
 */
export const launchStartVisitWorkspaceOutsideWorkspace: LaunchStartVisitWorkspace = async (workspaceProps) => {
  await launchWorkspace2('patient-search-app-start-visit-workspace', workspaceProps);
};

export interface PatientSearchContext2Props {
  onPatientSelected?(
    patientUuid: string,
    patient: fhir.Patient,
    launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
    closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
  ): void;
  /**
   * An optional function invoked after a visit is successfully started from the start visit
   * button on a patient search result card.
   */
  onVisitStarted?(
    patientUuid: string,
    patient: fhir.Patient,
    visit: Visit,
    launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
    closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
  ): void;
  /**
   * Launches the start visit workspace with the given workspace props. Whoever mounts the search results
   * supplies this, because the right call depends on where they are mounted: inside a workspace it
   * launches a child workspace, on the search page (no enclosing workspace) a top-level workspace.
   */
  launchStartVisitWorkspace: LaunchStartVisitWorkspace;
  /**
   * Only defined when the search results are mounted inside a workspace. These are what
   * `onPatientSelected` and `onVisitStarted` receive.
   */
  launchChildWorkspace?: Workspace2DefinitionProps['launchChildWorkspace'];
  closeWorkspace?: Workspace2DefinitionProps['closeWorkspace'];
  /**
   * Called just before following a result's link to the patient chart (e.g. to close the search overlay).
   * Not called when `onPatientSelected` or `selectPatientButton` handle the selection.
   */
  onBeforeNavigateToPatient?: PatientSelectionCallback;
  /**
   * When provided, patient search result cards are not clickable. Instead, each card renders
   * a button with this configuration that invokes onPatientSelected.
   */
  selectPatientButton?: SelectPatientButtonConfig;
}

export const PatientSearchContext2 = createContext<PatientSearchContext2Props>(null);
export const usePatientSearchContext2 = () => useContext(PatientSearchContext2);
