import { createContext } from 'react';

interface PatientSearchContextProps {
  nonNavigationSelectPatientAction?: (patientUuid: string) => void;
  patientClickSideEffect?: ((patientUuid: string) => void) | (() => void);
}

export const PatientSearchContext = createContext<PatientSearchContextProps>(null);
