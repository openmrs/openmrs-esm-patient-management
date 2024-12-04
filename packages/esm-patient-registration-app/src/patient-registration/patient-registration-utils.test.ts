import { filterOutUndefinedPatientIdentifiers } from './patient-registration-utils';

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

  it('should fitler out undefined identifiers', () => {
    const filteredIdentifiers = filterOutUndefinedPatientIdentifiers(getIdentifiers());
    expect(filteredIdentifiers.OpenMRSId).not.toBeDefined();
  });

  it('should retain auto-generated identifiers with manual entry', () => {
    const filteredIdentifiers = filterOutUndefinedPatientIdentifiers(getIdentifiers(true, true));
    expect(filteredIdentifiers.OpenMRSId).toBeDefined();
  });
});
