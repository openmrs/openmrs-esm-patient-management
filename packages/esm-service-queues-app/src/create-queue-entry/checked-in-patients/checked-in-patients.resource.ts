import { type Visit } from '@openmrs/esm-framework';

const genderMap = {
  M: 'male',
  F: 'female',
  O: 'other',
  U: 'unknown',
} as const satisfies Record<string, fhir.Patient['gender']>;

/**
 * Maps the REST `visit.patient` returned by `useActiveVisits` to the minimal `fhir.Patient` shape
 * consumed by the framework patient-banner components (`PatientBannerPatientInfo`,
 * `PatientBannerContactDetails`), so checked-in rows render identically to patient-search results.
 */
export function mapActiveVisitPatientToFhir(patient: Visit['patient']): fhir.Patient {
  const person = patient?.person;
  const preferredName = person?.preferredName;

  return {
    resourceType: 'Patient',
    id: patient?.uuid,
    name: [
      {
        given: [preferredName?.givenName, preferredName?.middleName].filter(Boolean),
        family: preferredName?.familyName,
        text: person?.display,
      },
    ],
    // Pass an unmapped gender code through unchanged rather than dropping it.
    gender: genderMap[person?.gender] ?? person?.gender,
    birthDate: person?.birthdate,
    // FHIR deceased[x] is a choice type: emit exactly one of the two representations.
    ...(person?.deathDate ? { deceasedDateTime: person.deathDate } : { deceasedBoolean: person?.dead }),
    identifier: (patient?.identifiers ?? []).map((identifier) => ({
      value: identifier.identifier,
      type: {
        text: identifier.identifierType?.name,
        coding: [{ code: identifier.identifierType?.uuid }],
      },
    })),
  };
}
