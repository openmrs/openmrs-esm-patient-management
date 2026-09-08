import { describe, it, expect } from 'vitest';
import { type Visit } from '@openmrs/esm-framework';
import { mapActiveVisitPatientToFhir } from './checked-in-patients.resource';

function patient(overrides: any = {}): Visit['patient'] {
  const { person: personOverrides, ...rest } = overrides;
  return {
    uuid: 'patient-1',
    identifiers: [{ identifier: '100ALICE', uuid: 'id-1', identifierType: { uuid: 'type-1', name: 'OpenMRS ID' } }],
    ...rest,
    person: {
      uuid: 'person-1',
      display: 'Alice Adams',
      age: 30,
      gender: 'F',
      birthdate: '1994-01-01',
      preferredName: { givenName: 'Alice', familyName: 'Adams' },
      dead: false,
      deathDate: null,
      ...personOverrides,
    },
  } as any;
}

describe('mapActiveVisitPatientToFhir', () => {
  it('maps a fully populated patient to the fhir shape', () => {
    expect(mapActiveVisitPatientToFhir(patient())).toMatchObject({
      resourceType: 'Patient',
      id: 'patient-1',
      gender: 'female',
      birthDate: '1994-01-01',
      name: [{ given: ['Alice'], family: 'Adams', text: 'Alice Adams' }],
      identifier: [{ value: '100ALICE', type: { text: 'OpenMRS ID', coding: [{ code: 'type-1' }] } }],
    });
  });

  it('includes the middle name in the given names when present', () => {
    const result = mapActiveVisitPatientToFhir(
      patient({ person: { preferredName: { givenName: 'Alice', middleName: 'May', familyName: 'Adams' } } }),
    );
    expect(result.name?.[0].given).toEqual(['Alice', 'May']);
  });

  it('does not throw and produces empty names when preferredName is missing', () => {
    const result = mapActiveVisitPatientToFhir(patient({ person: { preferredName: undefined } }));
    expect(result.name?.[0].given).toEqual([]);
    expect(result.name?.[0].family).toBeUndefined();
    expect(result.gender).toBe('female');
  });

  it('passes an unmapped gender code through unchanged', () => {
    expect(mapActiveVisitPatientToFhir(patient({ person: { gender: 'X' } })).gender).toBe('X');
  });

  it('emits deceasedDateTime (and not deceasedBoolean) when a death date is present', () => {
    const result = mapActiveVisitPatientToFhir(patient({ person: { dead: true, deathDate: '2020-05-01' } }));
    expect(result.deceasedDateTime).toBe('2020-05-01');
    expect(result).not.toHaveProperty('deceasedBoolean');
  });

  it('emits deceasedBoolean (and not deceasedDateTime) when dead without a death date', () => {
    const result = mapActiveVisitPatientToFhir(patient({ person: { dead: true, deathDate: null } }));
    expect(result.deceasedBoolean).toBe(true);
    expect(result).not.toHaveProperty('deceasedDateTime');
  });

  it('returns an empty identifier list when the patient has no identifiers', () => {
    expect(mapActiveVisitPatientToFhir(patient({ identifiers: undefined })).identifier).toEqual([]);
  });
});
