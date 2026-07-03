import { createContext, useContext } from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';

/**
 * @deprecated This context should be removed once the workspace v2 migration is completed,
 * as the callbacks in this context are incompatible with the new API
 */
export interface PatientSearchContextProps {
  /**
   * A function to execute instead of navigating the user to the patient
   * dashboard. If null/undefined, patient results will be links to the
   * patient dashboard.
   */
  nonNavigationSelectPatientAction?: (patientUuid: string, patient: fhir.Patient) => void;
  /**
   * A function to execute when the user clicks on a patient result. Will
   * be executed whether or not nonNavigationSelectPatientAction is defined,
   * just before navigation (or after nonNavigationSelectPatientAction is called).
   */
  patientClickSideEffect?: ((patientUuid: string, patient: fhir.Patient) => void) | (() => void);
  handleReturnToSearchList?: () => void;
  showPatientSearch?: () => void;
  hidePatientSearch?: () => void;
}

export const PatientSearchContext = createContext<PatientSearchContextProps>(null);
export const PatientSearchContextProvider = PatientSearchContext.Provider;
export const usePatientSearchContext = () => useContext(PatientSearchContext);

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

export interface PatientSearchContext2Props {
  onPatientSelected?(
    patientUuid: string,
    patient: fhir.Patient,
    launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
    closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
  ): void;
  launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'];
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  startVisitWorkspaceName: string;
  /**
   * When provided, patient search result cards are not clickable. Instead, each card renders
   * a button with this configuration that invokes onPatientSelected.
   */
  selectPatientButton?: SelectPatientButtonConfig;
}

export const PatientSearchContext2 = createContext<PatientSearchContext2Props>(null);
export const usePatientSearchContext2 = () => useContext(PatientSearchContext2);
