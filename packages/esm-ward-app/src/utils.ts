import { type Patient } from '@openmrs/esm-framework';

export function filterNewborns(patients: Patient[]) {
  return patients.filter((patient) => patient.person.age < 1);
}

export function filterReproductiveAge(patients: Patient[]) {
  return patients.filter((patient) => patient.person.age >= 10);
}

export function filterFemale(patients: Patient[]) {
  return patients.filter((patient) => patient.person.gender === 'F');
}
