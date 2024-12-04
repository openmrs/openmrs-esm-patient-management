import { FormManager } from './form-manager';
import { type FormValues } from './patient-registration.types';
import { generateIdentifier } from './patient-registration.resource';

jest.mock('./patient-registration.resource', () => ({
  ...jest.requireActual('./patient-registration.resource'),
  generateIdentifier: jest.fn(),
}));

const mockGenerateIdentifier = generateIdentifier as jest.Mock;

const formValues: FormValues = {
  patientUuid: '',
  givenName: '',
  middleName: '',
  familyName: '',
  additionalGivenName: '',
  additionalMiddleName: '',
  additionalFamilyName: '',
  addNameInLocalLanguage: false,
  gender: '',
  birthdate: '',
  yearsEstimated: 1000,
  monthsEstimated: 11,
  birthdateEstimated: false,
  telephoneNumber: '',
  isDead: false,
  deathDate: 'string',
  deathTime: '',
  deathTimeFormat: 'AM',
  deathCause: 'string',
  nonCodedCauseOfDeath: '',
  relationships: [],
  address: {
    address1: '',
    address2: '',
    cityVillage: '',
    stateProvince: 'New York',
    country: 'string',
    postalCode: 'string',
  },
  identifiers: {
    foo: {
      identifierUuid: 'aUuid',
      identifierName: 'Foo',
      required: false,
      initialValue: 'foo',
      identifierValue: 'foo',
      identifierTypeUuid: 'identifierType',
      preferred: true,
      autoGeneration: false,
      selectedSource: {
        uuid: 'some-uuid',
        name: 'unique',
        autoGenerationOption: { manualEntryEnabled: true, automaticGenerationEnabled: false },
      },
    },
  },
};

describe('FormManager', () => {
  describe('createIdentifiers', () => {
    it('uses the uuid of a field name if it exists', async () => {
      const result = await FormManager.savePatientIdentifiers(true, undefined, formValues.identifiers, {}, 'Nyc');
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

    it('should generate identifier if it has autoGeneration and manual entry disabled', async () => {
      formValues.identifiers.foo.autoGeneration = true;
      formValues.identifiers.foo.selectedSource.autoGenerationOption.manualEntryEnabled = false;
      mockGenerateIdentifier.mockResolvedValue({ data: { identifier: '10001V' } });
      await FormManager.savePatientIdentifiers(true, undefined, formValues.identifiers, {}, 'Nyc');
      expect(mockGenerateIdentifier.mock.calls).toHaveLength(1);
    });

    it('should not generate identifiers if manual entry enabled and identifier value given', async () => {
      formValues.identifiers.foo.autoGeneration = true;
      formValues.identifiers.foo.selectedSource.autoGenerationOption.manualEntryEnabled = true;
      await FormManager.savePatientIdentifiers(true, undefined, formValues.identifiers, {}, 'Nyc');
      expect(mockGenerateIdentifier.mock.calls).toHaveLength(0);
    });
  });
});
