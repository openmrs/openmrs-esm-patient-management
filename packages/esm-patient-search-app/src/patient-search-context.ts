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
   * When true, starting a visit for a patient from the search results (via the inline
   * "Start visit" button) will also run `onPatientSelected` for that patient once the visit
   * has been created. Consumers like the "Add patient to queue" flow use this so the user lands
   * directly on the selection form after starting a visit, instead of returning to the result list.
   */
  selectPatientOnVisitStarted?: boolean;
}

export const PatientSearchContext2 = createContext<PatientSearchContext2Props>(null);
export const usePatientSearchContext2 = () => useContext(PatientSearchContext2);
