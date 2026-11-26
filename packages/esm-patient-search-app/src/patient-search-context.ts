import { createContext, useContext } from 'react';
import { type Visit, type Workspace2DefinitionProps } from '@openmrs/esm-framework';

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
   * Supplied by an embedded search host to start a visit in its workspace. Standalone search
   * omits this launcher and links to the patient chart without offering a start visit button.
   */
  launchStartVisitWorkspace?: LaunchStartVisitWorkspace;
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
