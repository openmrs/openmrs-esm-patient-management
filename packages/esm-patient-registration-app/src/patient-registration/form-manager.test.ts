import FormManager from './form-manager';
import { FormValues } from './patient-registration-types';

jest.mock('./patient-registration.resource');

const formValues: FormValues = {
  patientUuid: '',
  givenName: '',
  middleName: '',
  familyName: '',
  unidentifiedPatient: false,
  additionalGivenName: '',
  additionalMiddleName: '',
  additionalFamilyName: '',
  addNameInLocalLanguage: false,
  gender: '',
  birthdate: '',
  yearsEstimated: 1000,
  monthsEstimated: 1000,
  birthdateEstimated: false,
  telephoneNumber: '',
  address1: '',
  address2: '',
  cityVillage: '',
  stateProvince: 'New York',
  country: 'string',
  postalCode: 'string',
  isDead: false,
  deathDate: 'string',
  deathCause: 'string',
  relationships: [],
  identifiers: [
    {
      uuid: 'aUuid',
      identifier: 'foo',
      identifierTypeUuid: 'identifierType',
      preferred: true,
      source: {
        uuid: 'some-uuid',
        name: 'unique',
        autoGenerationOption: { manualEntryEnabled: true, automaticGenerationEnabled: false },
      },
      action: 'ADD',
    },
  ],
};

describe('FormManager', () => {
  describe('createIdentifiers', () => {
    it('uses the uuid of a field name if it exists', async () => {
      const result = await FormManager.savePatientIdentifiers(
        true,
        undefined,
        formValues.identifiers,
        'Nyc',
        new AbortController(),
      );
      expect(result).toEqual([
        {
          uuid: 'aUuid',
          identifier: 'foo',
          identifierType: 'identifierType',
          location: 'Nyc',
          preferred: true,
        },
      ]);
    });
  });
});
