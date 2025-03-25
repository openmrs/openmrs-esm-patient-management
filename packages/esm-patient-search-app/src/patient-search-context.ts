import { createContext, useContext } from 'react';

export interface PatientSearchContextProps {
  /**
   * A function to execute instead of navigating the user to the patient
   * dashboard. If null/undefined, patient results will be links to the
   * patient dashboard.
   */
  nonNavigationSelectPatientAction?: (patientUuid: string) => void;
  /**
   * A function to execute when the user clicks on a patient result. Will
   * be executed whether or not nonNavigationSelectPatientAction is defined,
   * just before navigation (or after nonNavigationSelectPatientAction is called).
   */
  patientClickSideEffect?: ((patientUuid: string) => void) | (() => void);
  handleReturnToSearchList?: () => void;
  showPatientSearch?: () => void;
  hidePatientSearch?: () => void;
}

export const PatientSearchContext = createContext<PatientSearchContextProps>(null);
export const PatientSearchContextProvider = PatientSearchContext.Provider;
export const usePatientSearchContext = () => useContext(PatientSearchContext);
