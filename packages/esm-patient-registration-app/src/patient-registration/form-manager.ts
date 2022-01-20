import { v4 } from 'uuid';
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
} from './patient-registration-types';
import {
  addPatientIdentifier,
  deletePatientIdentifier,
  deletePersonName,
  generateIdentifier,
  savePatient,
  savePatientPhoto,
  saveRelationship,
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
  personAttributeSections: any,
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
    personAttributeSections: any,
  ): Promise<null> {
    await queueSynchronizationItem(
      patientRegistration,
      {
        isNewPatient,
        formValues: values,
        patientUuidMap,
        initialAddressFieldValues,
        identifierTypes,
        capturePhotoProps,
        patientPhotoConceptUuid,
        currentLocation,
        personAttributeSections,
        preliminaryPatient: FormManager.getPatientToCreate(
          values,
          personAttributeSections,
          patientUuidMap,
          initialAddressFieldValues,
          [],
        ),
      },
      {
        id: values.patientUuid,
        displayName: 'Patient registration',
        dependencies: [],
      },
    );

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
    personAttributeSections: any,
    abortController: AbortController,
  ): Promise<string> {
    const patientIdentifiers: PatientIdentifier[] = await FormManager.getPatientIdentifiersToCreate(
      values.identifiers,
      identifierTypes,
      currentLocation,
      abortController,
    );

    if (!isNewPatient) {
      await Promise.all(
        FormManager.savePatientIdentifiers(values.patientUuid, patientIdentifiers, values.identifiers, abortController),
      );
    }

    const createdPatient = FormManager.getPatientToCreate(
      values,
      personAttributeSections,
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
          .filter((m) => m.relationship)
          .map(({ relatedPerson: relatedPersonUuid, relationship }) => {
            const relationshipType = relationship.split('/')[0];
            const direction = relationship.split('/')[1];
            const thisPatientUuid = savePatientResponse.data.uuid;
            const isAToB = direction === 'aIsToB';
            const relationshipToSave = {
              personA: isAToB ? relatedPersonUuid : thisPatientUuid,
              personB: isAToB ? thisPatientUuid : relatedPersonUuid,
              relationshipType,
            };

            return saveRelationship(abortController, relationshipToSave);
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

  static getPatientIdentifiersToCreate(
    patientIdentifiers: PatientIdentifierValue[],
    identifierTypes: Array<PatientIdentifierType>,
    location: string,
    abortController: AbortController,
  ): Promise<Array<PatientIdentifier>> {
    const identifierTypeRequests: Array<Promise<PatientIdentifier>> = patientIdentifiers.map(
      async (patientIdentifier) => {
        const { identifierType: identifierTypeUuid, identifier, uuid, action, source } = patientIdentifier;
        const identifierType = identifierTypes.find((identifierType) => identifierType.uuid === identifierTypeUuid);
        if (identifier) {
          return {
            uuid,
            identifier,
            identifierType: identifierTypeUuid,
            location: location,
            preferred: identifierType?.isPrimary,
          };
        } else if (source && patientIdentifier?.autoGeneration) {
          const generateIdentifierResponse = await generateIdentifier(patientIdentifier.source.uuid, abortController);
          return {
            // is this undefined?
            uuid,
            identifier: generateIdentifierResponse.data.identifier,
            identifierType: identifierTypeUuid,
            location: location,
            preferred: identifierType?.isPrimary,
          };
        } else if (action === 'DELETE') {
          return {
            uuid,
            identifier: identifierTypeUuid,
            location,
            preferred: identifierType.isPrimary,
          };
        } else {
          // This is a case that should not occur.
          // If it did, the subsequent network request (when creating the patient) would fail with
          // BadRequest since the (returned) identifier type is undefined.
          // Better stop early.
          throw new Error('No approach for generating a patient identifier could be found.');
        }
      },
    );

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
    personAttributeSections: any,
    patientUuidMap: PatientUuidMapType,
    initialAddressFieldValues: Record<string, any>,
    identifiers: Array<PatientIdentifier>,
  ): Patient {
    let address = FormManager.getPatientAddressField(values, initialAddressFieldValues);

    if (isEqual(initialAddressFieldValues, address)) {
      address = {};
    }

    return {
      uuid: values.patientUuid,
      person: {
        uuid: values.patientUuid,
        names: FormManager.getNames(values, patientUuidMap),
        gender: values.gender.charAt(0),
        birthdate: values.birthdate,
        birthdateEstimated: values.birthdateEstimated,
        attributes: FormManager.getPatientAttributes(values, personAttributeSections),
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

  static savePatientIdentifiers(
    patientUuid: string,
    patientIdentifiers: PatientIdentifier[],
    identifiers: PatientIdentifierValue[],
    abortController: AbortController,
  ) {
    return identifiers.map((identifier, index) => {
      if (identifier.action === 'ADD') {
        return addPatientIdentifier(patientUuid, patientIdentifiers[index], abortController);
      } else if (identifier.action === 'UPDATE') {
        return updatePatientIdentifier(patientUuid, patientIdentifiers[index], abortController);
      } else if (identifier.action === 'DELETE') {
        deletePatientIdentifier(patientUuid, patientIdentifiers[index]?.uuid, abortController);
      }
    });
  }
}
