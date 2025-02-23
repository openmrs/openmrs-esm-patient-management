import { createContext } from 'react';

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
  /**
   * A function to set the Search windown back on in the patient search work space
   * on discarding the Start visit form
   */
  handleDiscardVisit?: () => void;
}

export const PatientSearchContext = createContext<PatientSearchContextProps>(null);
