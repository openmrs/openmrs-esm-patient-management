import { queueSynchronizationItem } from '@openmrs/esm-framework';
import { patientRegistration } from '../constants';
import {
  FormValues,
  PatientIdentifierType,
  AttributeValue,
  PatientUuidMapType,
  Patient,
  CapturePhotoProps,
  PatientIdentifier,
  PatientIdentifierValue,
  PatientRegistration,
  PersonAttributeTypeConfig,
} from './patient-registration-types';
import {
  addPatientIdentifier,
  deletePatientIdentifier,
  deletePersonName,
  deleteRelationship,
  generateIdentifier,
  savePatient,
  savePatientPhoto,
  saveRelationship,
  updateRelationship,
  updatePatientIdentifier,
} from './patient-registration.resource';
import isEqual from 'lodash-es/isEqual';

export type SavePatientForm = (
  isNewPatient: boolean,
  values: FormValues,
  patientUuidMap: PatientUuidMapType,
  initialAddressFieldValues: Record<string, any>,
  identifierTypes: Array<PatientIdentifierType>,
  capturePhotoProps: CapturePhotoProps,
  patientPhotoConceptUuid: string,
  currentLocation: string,
  personAttributeTypes: PersonAttributeTypeConfig,
  abortController?: AbortController,
) => Promise<string | null>;

export default class FormManager {
  static async savePatientFormOffline(
    isNewPatient: boolean,
    values: FormValues,
    patientUuidMap: PatientUuidMapType,
    initialAddressFieldValues: Record<string, any>,
    identifierTypes: Array<PatientIdentifierType>,
    capturePhotoProps: CapturePhotoProps,
    patientPhotoConceptUuid: string,
    currentLocation: string,
    personAttributeTypes: Array<PersonAttributeTypeConfig>,
  ): Promise<null> {
    const syncItem: PatientRegistration = {
      fhirPatient: FormManager.mapPatientToFhirPatient(
        FormManager.getPatientToCreate(values, personAttributeTypes, patientUuidMap, initialAddressFieldValues, []),
      ),
      _patientRegistrationData: {
        isNewPatient,
        formValues: values,
        patientUuidMap,
        initialAddressFieldValues,
        identifierTypes,
        capturePhotoProps,
        patientPhotoConceptUuid,
        currentLocation,
        personAttributeTypes,
      },
    };

    await queueSynchronizationItem(patientRegistration, syncItem, {
      id: values.patientUuid,
      displayName: 'Patient registration',
      patientUuid: syncItem.fhirPatient.id,
      dependencies: [],
    });

    return null;
  }

  static async savePatientFormOnline(
    isNewPatient: boolean,
    values: FormValues,
    patientUuidMap: PatientUuidMapType,
    initialAddressFieldValues: Record<string, any>,
    identifierTypes: Array<PatientIdentifierType>,
    capturePhotoProps: CapturePhotoProps,
    patientPhotoConceptUuid: string,
    currentLocation: string,
    personAttributeTypes: Array<PersonAttributeTypeConfig>,
    abortController: AbortController,
  ): Promise<string> {
    const patientIdentifiers: Array<PatientIdentifier> = await FormManager.savePatientIdentifiers(
      isNewPatient,
      values.patientUuid,
      values.identifiers,
      currentLocation,
      abortController,
    );

    const createdPatient = FormManager.getPatientToCreate(
      values,
      personAttributeTypes,
      patientUuidMap,
      initialAddressFieldValues,
      patientIdentifiers,
    );

    FormManager.getDeletedNames(values.patientUuid, patientUuidMap).forEach(async (name) => {
      await deletePersonName(name.nameUuid, name.personUuid, abortController);
    });

    const savePatientResponse = await savePatient(
      abortController,
      createdPatient,
      isNewPatient ? undefined : values.patientUuid,
    );

    if (savePatientResponse.ok) {
      await Promise.all(
        values.relationships
          .filter((m) => m.relationshipType)
          .filter((relationship) => !!relationship.action)
          .map(({ relatedPersonUuid, relationshipType, uuid: relationshipUuid, action }) => {
            const [type, direction] = relationshipType.split('/');
            const thisPatientUuid = savePatientResponse.data.uuid;
            const isAToB = direction === 'aIsToB';
            const relationshipToSave = {
              personA: isAToB ? relatedPersonUuid : thisPatientUuid,
              personB: isAToB ? thisPatientUuid : relatedPersonUuid,
              relationshipType: type,
            };

            switch (action) {
              case 'ADD':
                return saveRelationship(abortController, relationshipToSave);
              case 'UPDATE':
                return updateRelationship(abortController, relationshipUuid, relationshipToSave);
              case 'DELETE':
                return deleteRelationship(abortController, relationshipUuid);
            }
          }),
      );

      if (patientPhotoConceptUuid && capturePhotoProps?.imageData) {
        await savePatientPhoto(
          savePatientResponse.data.uuid,
          capturePhotoProps.imageData,
          '/ws/rest/v1/obs',
          capturePhotoProps.dateTime || new Date().toISOString(),
          patientPhotoConceptUuid,
          abortController,
        );
      }
    }

    return savePatientResponse.data.uuid;
  }

  static async savePatientIdentifiers(
    isNewPatient: boolean,
    patientUuid: string,
    patientIdentifiers: Array<PatientIdentifierValue>, // values.identifiers
    location: string,
    abortController: AbortController,
  ): Promise<Array<PatientIdentifier>> {
    let identifierTypeRequests = patientIdentifiers
      .filter((identifier) => identifier.action !== 'DELETE' && identifier.action !== 'NONE')
      .map(async (patientIdentifier) => {
        const { identifierTypeUuid, identifier, uuid, action, source, preferred, autoGeneration } = patientIdentifier;
        if (identifier || (source && autoGeneration)) {
          const identifierValue = identifier
            ? identifier
            : await (
                await generateIdentifier(patientIdentifier.source.uuid, abortController)
              ).data.identifier;
          const identifierToCreate = {
            uuid,
            identifier: identifierValue,
            identifierType: identifierTypeUuid,
            location,
            preferred,
          };

          if (!isNewPatient) {
            if (action === 'ADD') {
              await addPatientIdentifier(patientUuid, identifierToCreate, abortController);
            } else if (action === 'UPDATE') {
              await updatePatientIdentifier(patientUuid, uuid, identifierToCreate.identifier, abortController);
            }
          }

          return identifierToCreate;
        } else {
          // This is a case that should not occur.
          // If it did, the subsequent network request (when creating the patient) would fail with
          // BadRequest since the (returned) identifier type is undefined.
          // Better stop early.
          throw new Error('No approach for generating a patient identifier could be found.');
        }
      });

    if (patientUuid) {
      patientIdentifiers
        .filter((patientIdentifier) => patientIdentifier.action === 'DELETE')
        .forEach(
          async (patientIdentifier) =>
            await deletePatientIdentifier(patientUuid, patientIdentifier.uuid, abortController),
        );
    }

    return Promise.all(identifierTypeRequests);
  }

  static getDeletedNames(patientUuid: string, patientUuidMap: PatientUuidMapType) {
    if (patientUuidMap?.additionalNameUuid) {
      return [
        {
          nameUuid: patientUuidMap.additionalNameUuid,
          personUuid: patientUuid,
        },
      ];
    }
    return [];
  }

  static getPatientToCreate(
    values: FormValues,
    personAttributeTypes: Array<PersonAttributeTypeConfig>,
    patientUuidMap: PatientUuidMapType,
    initialAddressFieldValues: Record<string, any>,
    identifiers: Array<PatientIdentifier>,
  ): Patient {
    let address = FormManager.getPatientAddressField(values, initialAddressFieldValues);
    let birthdate;
    if (values.birthdate instanceof Date) {
      birthdate = [values.birthdate.getFullYear(), values.birthdate.getMonth() + 1, values.birthdate.getDate()].join(
        '-',
      );
    } else {
      birthdate = values.birthdate;
    }
    if (isEqual(initialAddressFieldValues, address)) {
      address = {};
    }

    return {
      uuid: values.patientUuid,
      person: {
        uuid: values.patientUuid,
        names: FormManager.getNames(values, patientUuidMap),
        gender: values.gender.charAt(0),
        birthdate,
        birthdateEstimated: values.birthdateEstimated,
        attributes: FormManager.getPatientAttributes(values, personAttributeTypes),
        addresses: [address],
        ...FormManager.getPatientDeathInfo(values),
      },
      identifiers,
    };
  }

  static getNames(values: FormValues, patientUuidMap: PatientUuidMapType) {
    const names = [
      {
        uuid: patientUuidMap.preferredNameUuid,
        preferred: true,
        givenName: values.givenName,
        middleName: values.middleName,
        familyName: values.familyName,
      },
    ];

    if (values.addNameInLocalLanguage) {
      names.push({
        uuid: patientUuidMap.additionalNameUuid,
        preferred: false,
        givenName: values.additionalGivenName,
        middleName: values.additionalMiddleName,
        familyName: values.additionalFamilyName,
      });
    }

    return names;
  }

  static getPatientAttributes(values: FormValues, personAttributeTypes?: Array<PersonAttributeTypeConfig>) {
    const attributes: Array<AttributeValue> = [];

    if (personAttributeTypes) {
      for (const attr of personAttributeTypes) {
        attributes.push({
          attributeType: attr.uuid,
          value: values.attributes[attr.uuid],
        });
      }
    }

    return attributes;
  }

  static getPatientAddressField(
    values: FormValues,
    initialAddressFieldValues: Record<string, any>,
  ): Record<string, string> {
    return Object.keys(initialAddressFieldValues).reduce(
      (memo, fieldName) => ({ ...memo, [fieldName]: values[fieldName] }),
      {},
    );
  }

  static getPatientDeathInfo(values: FormValues) {
    const { isDead, deathDate, deathCause } = values;
    return {
      dead: isDead,
      deathDate: isDead ? deathDate : undefined,
      causeOfDeath: isDead ? deathCause : undefined,
    };
  }

  static mapPatientToFhirPatient(patient: Partial<Patient>): fhir.Patient {
    // Important:
    // When changing this code, ideally assume that `patient` can be missing any attribute.
    // The `fhir.Patient` provides us with the benefit that all properties are nullable and thus
    // not required (technically, at least). -> Even if we cannot map some props here, we still
    // provide a valid fhir.Patient object. The various patient chart modules should be able to handle
    // such missing props correctly (and should be updated if they don't).

    // Gender in the original object only uses a single letter. fhir.Patient expects a full string.
    const genderMap = {
      M: 'male',
      F: 'female',
      O: 'other',
      U: 'unknown',
    };

    // Mapping inspired by:
    // https://github.com/openmrs/openmrs-module-fhir/blob/669b3c52220bb9abc622f815f4dc0d8523687a57/api/src/main/java/org/openmrs/module/fhir/api/util/FHIRPatientUtil.java#L36
    // https://github.com/openmrs/openmrs-esm-patient-management/blob/94e6f637fb37cf4984163c355c5981ea6b8ca38c/packages/esm-patient-search-app/src/patient-search-result/patient-search-result.component.tsx#L21
    // Update as required.
    return {
      id: patient.uuid,
      gender: genderMap[patient.person?.gender],
      birthDate: patient.person?.birthdate,
      deceasedBoolean: patient.person.dead,
      deceasedDateTime: patient.person.deathDate,
      name: patient.person?.names?.map((name) => ({
        given: [name.givenName, name.middleName].filter(Boolean),
        family: name.familyName,
      })),
      address: patient.person?.addresses.map((address) => ({
        city: address.cityVillage,
        country: address.country,
        postalCode: address.postalCode,
        state: address.stateProvince,
        use: 'home',
      })),
      telecom: patient.person.attributes?.filter((attribute) => attribute.attributeType === 'Telephone Number'),
    };
  }
}
