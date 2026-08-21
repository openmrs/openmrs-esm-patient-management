import { FormManager, SavePatientTransactionManager } from './form-manager';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { type FetchResponse, openmrsFetch, type Session } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../config-schema';
import { type FormValues, type PatientUuidMapType } from './patient-registration.types';
import {
  deletePatientIdentifier,
  deletePersonName,
  generateIdentifier,
  savePatient,
} from './patient-registration.resource';

vi.mock('./patient-registration.resource', async () => ({
  ...((await vi.importActual('./patient-registration.resource')) as object),
  deletePatientIdentifier: vi.fn(),
  deletePersonName: vi.fn(),
  generateIdentifier: vi.fn(),
  savePatient: vi.fn(),
}));

const mockDeletePatientIdentifier = vi.mocked(deletePatientIdentifier);
const mockDeletePersonName = vi.mocked(deletePersonName);
const mockGenerateIdentifier = vi.mocked(generateIdentifier);
const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockSavePatient = vi.mocked(savePatient);

function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

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
  const successfulResponse = { data: {}, ok: true } as FetchResponse;
  const savedPatientResponse = { data: { uuid: 'patient-uuid' }, ok: true } as FetchResponse;

  beforeEach(() => {
    mockDeletePatientIdentifier.mockReset().mockResolvedValue(successfulResponse);
    mockDeletePersonName.mockReset().mockResolvedValue(successfulResponse);
    mockOpenmrsFetch.mockReset().mockResolvedValue(successfulResponse);
    mockSavePatient.mockReset().mockResolvedValue(savedPatientResponse);
  });

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

  describe('getDeletedNames', () => {
    const patientUuid = 'patient-uuid';
    const patientUuidMap = { additionalNameUuid: 'additional-name-uuid' };

    it('does not delete the local-language name when the option is still enabled', () => {
      const values: FormValues = { ...formValues, patientUuid, addNameInLocalLanguage: true };

      expect(FormManager.getDeletedNames(values, patientUuidMap)).toEqual([]);
    });

    it('deletes the local-language name when the option has been disabled', () => {
      const values: FormValues = { ...formValues, patientUuid, addNameInLocalLanguage: false };

      expect(FormManager.getDeletedNames(values, patientUuidMap)).toEqual([
        { nameUuid: 'additional-name-uuid', personUuid: patientUuid },
      ]);
    });

    it('updates the local-language name rather than deleting it when it is edited', () => {
      const values: FormValues = {
        ...formValues,
        patientUuid,
        addNameInLocalLanguage: true,
        additionalGivenName: 'Wanjiru',
        additionalMiddleName: '',
        additionalFamilyName: 'Kamau',
      };

      expect(FormManager.getDeletedNames(values, patientUuidMap)).toEqual([]);
      expect(FormManager.getNames(values, patientUuidMap)).toContainEqual({
        uuid: 'additional-name-uuid',
        preferred: false,
        givenName: 'Wanjiru',
        middleName: '',
        familyName: 'Kamau',
      });
    });

    it('returns no deletions when the patient has no local-language name', () => {
      const values: FormValues = { ...formValues, patientUuid, addNameInLocalLanguage: false };

      expect(FormManager.getDeletedNames(values, {})).toEqual([]);
    });
  });

  describe('awaiting patient data deletions', () => {
    const config = {
      registrationObs: {
        encounterTypeUuid: null,
        encounterProviderRoleUuid: '',
        registrationFormUuid: null,
      },
      freeTextFieldConceptUuid: '',
    } as RegistrationConfig;
    const currentUser = {} as Session;

    const saveExistingPatient = (
      values: Partial<FormValues>,
      patientUuidMap: PatientUuidMapType,
      initialIdentifierValues: FormValues['identifiers'] = {},
    ) =>
      FormManager.savePatientFormOnline(
        false,
        {
          ...formValues,
          patientUuid: 'patient-uuid',
          identifiers: {},
          relationships: [],
          ...values,
        },
        patientUuidMap,
        {},
        { imageData: '', dateTime: '' },
        'location-uuid',
        initialIdentifierValues,
        currentUser,
        config,
        new SavePatientTransactionManager(),
      );

    it('waits for name deletion before saving the patient', async () => {
      const deletion = createDeferred<FetchResponse>();
      mockDeletePersonName.mockReturnValue(deletion.promise);

      const savePromise = saveExistingPatient({}, { additionalNameUuid: 'additional-name-uuid' });

      await vi.waitFor(() => expect(mockDeletePersonName).toHaveBeenCalled());
      expect(mockSavePatient).not.toHaveBeenCalled();

      deletion.resolve(successfulResponse);
      await savePromise;

      expect(mockSavePatient).toHaveBeenCalledOnce();
    });

    it('waits for identifier deletion before saving the patient', async () => {
      const deletion = createDeferred<FetchResponse>();
      mockDeletePatientIdentifier.mockReturnValue(deletion.promise);

      const savePromise = saveExistingPatient({}, {}, { foo: formValues.identifiers.foo });

      await vi.waitFor(() => expect(mockDeletePatientIdentifier).toHaveBeenCalled());
      expect(mockSavePatient).not.toHaveBeenCalled();

      deletion.resolve(successfulResponse);
      await savePromise;

      expect(mockSavePatient).toHaveBeenCalledOnce();
    });

    it('waits for attribute deletion before saving the patient', async () => {
      const deletion = createDeferred<FetchResponse>();
      mockOpenmrsFetch.mockReturnValue(deletion.promise);
      const patientUuidMap = {
        preferredNameUuid: 'preferred-name-uuid',
        'attribute.attribute-type-uuid': 'attribute-uuid',
      } as PatientUuidMapType;

      const savePromise = saveExistingPatient({ attributes: { 'attribute-type-uuid': '' } }, patientUuidMap);

      await vi.waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalled());
      expect(mockSavePatient).not.toHaveBeenCalled();

      deletion.resolve(successfulResponse);
      await savePromise;

      expect(mockSavePatient).toHaveBeenCalledOnce();
    });

    it('rejects the save when name deletion fails', async () => {
      const error = new Error('Name deletion failed');
      mockDeletePersonName.mockRejectedValue(error);

      await expect(saveExistingPatient({}, { additionalNameUuid: 'additional-name-uuid' })).rejects.toBe(error);
      expect(mockSavePatient).not.toHaveBeenCalled();
    });

    it('rejects the save when identifier deletion fails', async () => {
      const error = new Error('Identifier deletion failed');
      mockDeletePatientIdentifier.mockRejectedValue(error);

      await expect(saveExistingPatient({}, {}, { foo: formValues.identifiers.foo })).rejects.toBe(error);
      expect(mockSavePatient).not.toHaveBeenCalled();
    });

    it('rejects the save when attribute deletion fails', async () => {
      const error = new Error('Attribute deletion failed');
      mockOpenmrsFetch.mockRejectedValue(error);
      const patientUuidMap = {
        preferredNameUuid: 'preferred-name-uuid',
        'attribute.attribute-type-uuid': 'attribute-uuid',
      } as PatientUuidMapType;

      await expect(saveExistingPatient({ attributes: { 'attribute-type-uuid': '' } }, patientUuidMap)).rejects.toBe(
        error,
      );
      expect(mockSavePatient).not.toHaveBeenCalled();
    });
  });
});
