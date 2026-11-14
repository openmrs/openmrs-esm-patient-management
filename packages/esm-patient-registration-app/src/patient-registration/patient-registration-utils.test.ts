import { filterOutUndefinedPatientIdentifiers, getFormValuesFromFhirPatient } from './patient-registration-utils';
import { vi, describe, it, expect } from 'vitest';

describe('filterOutUndefinedPatientIdentifiers', () => {
  const getIdentifiers = (autoGeneration = true, manualEntryEnabled = false) => ({
    OpenMRSId: {
      autoGeneration: autoGeneration,
      identifierName: 'OpenMRS ID',
      identifierTypeUuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
      identifierValue: undefined,
      initialValue: '100GEJ',
      preferred: true,
      required: true,
      selectedSource: {
        uuid: '01af8526-cea4-4175-aa90-340acb411771',
        name: 'Generator for OpenMRS ID',
        autoGenerationOption: {
          manualEntryEnabled: manualEntryEnabled,
          automaticGenerationEnabled: autoGeneration,
        },
      },
    },
  });

  it('should filter out undefined identifiers', () => {
    const filteredIdentifiers = filterOutUndefinedPatientIdentifiers(getIdentifiers());
    expect(filteredIdentifiers.OpenMRSId).not.toBeDefined();
  });

  it('should retain auto-generated identifiers with manual entry', () => {
    const filteredIdentifiers = filterOutUndefinedPatientIdentifiers(getIdentifiers(true, true));
    expect(filteredIdentifiers.OpenMRSId).toBeDefined();
  });
});

describe('getFormValuesFromFhirPatient', () => {
  const patient = (name: fhir.HumanName) =>
    ({ resourceType: 'Patient', id: 'patient-uuid', name: [name], identifier: [], gender: 'female' }) as fhir.Patient;

  it('reads the name parts FHIR has no field for from the OpenMRS name extension', () => {
    const values = getFormValuesFromFhirPatient(
      patient({
        id: 'name-uuid',
        given: ['Ana', 'María'],
        family: 'García',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/name',
            extension: [
              { url: 'http://fhir.openmrs.org/ext/name#familyName2', valueString: 'López' },
              { url: 'http://fhir.openmrs.org/ext/name#prefix', valueString: 'Sra.' },
              { url: 'http://fhir.openmrs.org/ext/name#unknownPart', valueString: 'ignored' },
            ],
          },
        ],
      }),
    );

    expect(values).toEqual(
      expect.objectContaining({
        givenName: 'Ana',
        middleName: 'María',
        familyName: 'García',
        familyName2: 'López',
        prefix: 'Sra.',
      }),
    );
    expect(values).not.toHaveProperty('unknownPart');
  });

  it('leaves the extra name parts out when the name has none', () => {
    const values = getFormValuesFromFhirPatient(patient({ id: 'name-uuid', given: ['Ana'], family: 'García' }));

    expect(values).not.toHaveProperty('familyName2');
    expect(values).not.toHaveProperty('prefix');
  });
});
