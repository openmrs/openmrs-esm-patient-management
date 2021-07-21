import { queueSynchronizationItem } from '@openmrs/esm-framework';
import { v4 } from 'uuid';
import { patientRegistration } from '../constants';
import {
  FormValues,
  PatientIdentifierType,
  AttributeValue,
  PatientUuidMapType,
  Patient,
  CapturePhotoProps,
  PatientIdentifier,
} from './patient-registration-types';
import {
  deletePersonName,
  generateIdentifier,
  savePatient,
  savePatientPhoto,
  saveRelationship,
} from './patient-registration.resource';

export type SavePatientForm = (
  patientUuid: string | undefined,
  values: FormValues,
  patientUuidMap: PatientUuidMapType,
  initialAddressFieldValues: Record<string, any>,
  identifierTypes: Array<PatientIdentifierType>,
  capturePhotoProps: CapturePhotoProps,
  patientPhotoConceptUuid: string,
  currentLocation: string,
  personAttributeSections: any,
  abortController?: AbortController,
) => Promise<string | null>;

export default class FormManager {
  static async savePatientFormOffline(
    patientUuid = v4(),
    values: FormValues,
    patientUuidMap: PatientUuidMapType,
    initialAddressFieldValues: Record<string, any>,
    identifierTypes: Array<PatientIdentifierType>,
    capturePhotoProps: CapturePhotoProps,
    patientPhotoConceptUuid: string,
    currentLocation: string,
    personAttributeSections: any,
  ): Promise<null> {
    await queueSynchronizationItem(
      patientRegistration,
      {
        patientUuid,
        formValues: values,
        patientUuidMap,
        initialAddressFieldValues,
        identifierTypes,
        capturePhotoProps,
        patientPhotoConceptUuid,
        currentLocation,
        personAttributeSections,
      },
      {
        id: patientUuid,
        dependencies: [],
      },
    );

    return null;
  }

  static async savePatientFormOnline(
    patientUuid: string | undefined,
    values: FormValues,
    patientUuidMap: PatientUuidMapType,
    initialAddressFieldValues: Record<string, any>,
    identifierTypes: Array<PatientIdentifierType>,
    capturePhotoProps: CapturePhotoProps,
    patientPhotoConceptUuid: string,
    currentLocation: string,
    personAttributeSections: any,
    abortController: AbortController,
  ): Promise<string> {
    const patientIdentifiers = await FormManager.getPatientIdentifiersToCreate(
      values,
      patientUuidMap,
      identifierTypes,
      currentLocation,
      abortController,
    );

    const createdPatient = FormManager.getPatientToCreate(
      values,
      personAttributeSections,
      patientUuidMap,
      initialAddressFieldValues,
      patientIdentifiers,
    );

    FormManager.getDeletedNames(patientUuidMap).forEach(async (name) => {
      await deletePersonName(name.nameUuid, name.personUuid, abortController);
    });

    const savePatientResponse = await savePatient(abortController, createdPatient, patientUuidMap.patientUuid);
    if (savePatientResponse.ok) {
      values.relationships.map(({ relatedPerson: relatedPersonUuid, relationship }) => {
        const relationshipType = relationship.split('/')[0];
        const direction = relationship.split('/')[1];
        const thisPatientUuid = savePatientResponse.data.uuid;
        const isAToB = direction === 'aIsToB';
        const relationshipToSave = {
          personA: isAToB ? relatedPersonUuid : thisPatientUuid,
          personB: isAToB ? thisPatientUuid : relatedPersonUuid,
          relationshipType,
        };

        saveRelationship(abortController, relationshipToSave);
      });

      if (
        capturePhotoProps &&
        patientPhotoConceptUuid &&
        (capturePhotoProps.base64EncodedImage || capturePhotoProps.imageFile)
      ) {
        savePatientPhoto(
          savePatientResponse.data.uuid,
          capturePhotoProps.imageFile,
          null,
          abortController,
          capturePhotoProps.base64EncodedImage,
          '/ws/rest/v1/obs',
          capturePhotoProps.photoDateTime,
          patientPhotoConceptUuid,
        );
      }
    }

    return savePatientResponse.data.uuid;
  }

  static getPatientIdentifiersToCreate(
    values: FormValues,
    patientUuidMap: object,
    identifierTypes: Array<PatientIdentifierType>,
    location: string,
    abortController: AbortController,
  ): Promise<Array<PatientIdentifier>> {
    const identifierTypeRequests: Array<Promise<PatientIdentifier>> = identifierTypes.map(async (type) => {
      const idValue = values[type.fieldName];
      
      if (idValue) {
        return {
          uuid: patientUuidMap[type.fieldName] ? patientUuidMap[type.fieldName].uuid : undefined,
          identifier: idValue,
          identifierType: type.uuid,
          location: location,
          preferred: type.isPrimary,
        };
      } else if (type.autoGenerationSource) {
        const generateIdentifierResponse = await generateIdentifier(type.autoGenerationSource.uuid, abortController);
        return {
          // is this undefined?
          uuid: undefined,
          identifier: generateIdentifierResponse.data.identifier,
          identifierType: type.uuid,
          location: location,
          preferred: type.isPrimary,
        };
      } else {
        // This is a case that should not occur.
        // If it did, the subsequent network request (when creating the patient) would fail with
        // BadRequest since the (returned) identifier type is undefined.
        // Better stop early.
        throw new Error('No approach for generating a patient identifier could be found.');
      }
    });

    return Promise.all(identifierTypeRequests);
  }

  static getDeletedNames(patientUuidMap: PatientUuidMapType) {
    if (patientUuidMap?.additionalNameUuid) {
      return [
        {
          nameUuid: patientUuidMap.additionalNameUuid,
          personUuid: patientUuidMap.patientUuid,
        },
      ];
    }
    return [];
  }

  static getPatientToCreate(
    values: FormValues,
    personAttributeSections: any,
    patientUuidMap: PatientUuidMapType,
    initialAddressFieldValues: Record<string, any>,
    identifiers: Array<PatientIdentifier>,
  ): Patient {
    return {
      uuid: patientUuidMap['patientUuid'],
      person: {
        uuid: patientUuidMap['patientUuid'],
        names: FormManager.getNames(values, patientUuidMap),
        gender: values.gender.charAt(0),
        birthdate: values.birthdate,
        birthdateEstimated: values.birthdateEstimated,
        attributes: FormManager.getPatientAttributes(values, personAttributeSections),
        addresses: [FormManager.getPatientAddressField(values, initialAddressFieldValues)],
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

  static getPatientAttributes(values: FormValues, personAttributeSections?: any) {
    const attributes: Array<AttributeValue> = [];

    if (personAttributeSections) {
      for (const section of personAttributeSections) {
        for (const attr of section.personAttributes) {
          attributes.push({
            attributeType: attr.uuid,
            value: values[attr.name],
          });
        }
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
}
