export type SortCriteria = 'firstName' | 'lastName' | 'youngest' | 'oldest';

export const usePatientResultsSort = (patients: Array<fhir.Patient>, sortCriteria: SortCriteria) => {
  if (sortCriteria === 'firstName') {
    return patients;
  }
  if (sortCriteria === 'lastName') {
    return patients.sort(
      (patientA, patientB) => new Date(patientA.birthDate).getTime() - new Date(patientB.birthDate).getTime(),
    );
  }

  if (sortCriteria === 'oldest') {
    return patients.sort(
      (patientA, patientB) => new Date(patientA.birthDate).getTime() - new Date(patientB.birthDate).getTime(),
    );
  }
  if (sortCriteria === 'youngest') {
    return patients.sort(
      (patientA, patientB) => new Date(patientB.birthDate).getTime() - new Date(patientA.birthDate).getTime(),
    );
  }
  return patients;
};
