import { FormManager, SavePatientTransactionManager } from './form-manager';
import { vi, describe, it, expect } from 'vitest';
import { type FormValues } from './patient-registration.types';
import { type RegistrationConfig } from '../config-schema';
import { generateIdentifier, savePatient } from './patient-registration.resource';

vi.mock('./patient-registration.resource', async () => ({
  ...((await vi.importActual('./patient-registration.resource')) as object),
  generateIdentifier: vi.fn(),
  savePatient: vi.fn(),
}));

const mockGenerateIdentifier = vi.mocked(generateIdentifier);
const mockSavePatient = vi.mocked(savePatient);

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
      mockGenerateIdentifier.mockResolvedValue({ data: { identifier: '10001V' } } as any);
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

  describe('getPatientDeathInfo', () => {
    const config = { freeTextFieldConceptUuid: 'free-text-uuid' } as RegistrationConfig;

    it('explicitly clears the death metadata when the patient is marked as alive', () => {
      const values: FormValues = {
        ...formValues,
        isDead: false,
        deathDate: '2024-01-01',
        deathCause: 'cause-uuid',
        nonCodedCauseOfDeath: 'Hit by a bus',
      };

      expect(FormManager.getPatientDeathInfo(values, config)).toEqual({
        dead: false,
        deathDate: null,
        causeOfDeath: null,
        causeOfDeathNonCoded: null,
      });
    });

    it('sends a coded cause of death and clears the non-coded one', () => {
      const values: FormValues = {
        ...formValues,
        isDead: true,
        deathDate: '2024-01-01',
        deathTime: '10:30',
        deathTimeFormat: 'AM',
        deathCause: 'cause-uuid',
        nonCodedCauseOfDeath: '',
      };

      const deathInfo = FormManager.getPatientDeathInfo(values, config);

      expect(deathInfo.dead).toBe(true);
      expect(deathInfo.causeOfDeath).toBe('cause-uuid');
      expect(deathInfo.causeOfDeathNonCoded).toBeNull();
      expect(deathInfo.deathDate).toBeTruthy();
    });

    it('sends a non-coded cause of death and clears the coded one', () => {
      const values: FormValues = {
        ...formValues,
        isDead: true,
        deathDate: '2024-01-01',
        deathTime: '10:30',
        deathTimeFormat: 'AM',
        deathCause: 'free-text-uuid',
        nonCodedCauseOfDeath: 'Hit by a bus',
      };

      const deathInfo = FormManager.getPatientDeathInfo(values, config);

      expect(deathInfo.dead).toBe(true);
      expect(deathInfo.causeOfDeathNonCoded).toBe('Hit by a bus');
      expect(deathInfo.causeOfDeath).toBeNull();
    });
  });

  describe('savePatientFormOnline death metadata payload', () => {
    const config = { freeTextFieldConceptUuid: 'free-text-uuid' } as RegistrationConfig;

    it('sends explicit nulls so the REST API clears the stored death metadata', async () => {
      mockSavePatient.mockResolvedValue({ ok: false, data: { uuid: 'patient-uuid' } } as never);

      const values: FormValues = {
        ...formValues,
        patientUuid: 'patient-uuid',
        identifiers: {},
        isDead: false,
        deathDate: '2024-01-01',
        deathCause: 'cause-uuid',
        nonCodedCauseOfDeath: 'Hit by a bus',
      };

      await FormManager.savePatientFormOnline(
        false,
        values,
        {},
        {},
        undefined,
        'Nyc',
        {},
        undefined,
        config,
        new SavePatientTransactionManager(),
      );

      expect(mockSavePatient).toHaveBeenCalledTimes(1);
      const [payload] = mockSavePatient.mock.calls[0];

      expect(payload.person).toMatchObject({
        dead: false,
        deathDate: null,
        causeOfDeath: null,
        causeOfDeathNonCoded: null,
      });
    });
  });
});
