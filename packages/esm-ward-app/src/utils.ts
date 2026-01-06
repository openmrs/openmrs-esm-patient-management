import { type Patient } from '@openmrs/esm-framework';

// TODO: potentially move these rules into config so they can be customized and defined in a centralized place

export function filterNewborns(patients: Patient[]) {
  return patients.filter((patient) => patient.person.age != null && patient.person.age < 1);
}

export function filterReproductiveAge(patients: Patient[]) {
  return patients.filter((patient) => patient.person.age != null && patient.person.age >= 10);
}

export function filterFemale(patients: Patient[]) {
  return patients.filter((patient) => patient.person.gender === 'F');
}
