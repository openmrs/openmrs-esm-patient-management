import { FetchResponse, queueSynchronizationItem, Session } from '@openmrs/esm-framework';
import { patientRegistration } from '../constants';
import {
  FormValues,
  AttributeValue,
  PatientUuidMapType,
  Patient,
  CapturePhotoProps,
  PatientIdentifier,
  PatientRegistration,
  RelationshipValue,
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
import { RegistrationConfig } from '../config-schema';

export type SavePatientForm = (
  isNewPatient: boolean,
  values: FormValues,
  patientUuidMap: PatientUuidMapType,
  initialAddressFieldValues: Record<string, any>,
  capturePhotoProps: CapturePhotoProps,
  patientPhotoConceptUuid: string,
  currentLocation: string,
  initialIdentifierValues: FormValues['identifiers'],
  abortController?: AbortController,
) => Promise<string | null>;

export default class FormManager {
  static async savePatientFormOffline(
    isNewPatient: boolean,
    values: FormValues,
    patientUuidMap: PatientUuidMapType,
    initialAddressFieldValues: Record<string, any>,
    capturePhotoProps: CapturePhotoProps,
    patientPhotoConceptUuid: string,
    currentLocation: string,
    initialIdentifierValues: FormValues['identifiers'],
  ): Promise<null> {
    const syncItem: PatientRegistration = {
      fhirPatient: FormManager.mapPatientToFhirPatient(
        FormManager.getPatientToCreate(values, patientUuidMap, initialAddressFieldValues, []),
      ),
      _patientRegistrationData: {
        isNewPatient,
        formValues: values,
        patientUuidMap,
        initialAddressFieldValues,
        capturePhotoProps,
        patientPhotoConceptUuid,
        currentLocation,
        initialIdentifierValues,
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
    capturePhotoProps: CapturePhotoProps,
    currentLocation: string,
    initialIdentifierValues: FormValues['identifiers'],
    currentUser: Session,
    config: RegistrationConfig,
    abortController: AbortController,
  ): Promise<string> {
    const patientIdentifiers: Array<PatientIdentifier> = await FormManager.savePatientIdentifiers(
      isNewPatient,
      values.patientUuid,
      values.identifiers,
      initialIdentifierValues,
      currentLocation,
      abortController,
    );

    const createdPatient = FormManager.getPatientToCreate(
      values,
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
      await this.saveRelationships(values.relationships, savePatientResponse, abortController);

      await this.saveObservations(
        values.obs,
        savePatientResponse,
        currentLocation,
        currentUser,
        config,
        abortController,
      );

      if (config.concepts.patientPhotoUuid && capturePhotoProps?.imageData) {
        await savePatientPhoto(
          savePatientResponse.data.uuid,
          capturePhotoProps.imageData,
          '/ws/rest/v1/obs',
          capturePhotoProps.dateTime || new Date().toISOString(),
          config.concepts.patientPhotoUuid,
          abortController,
        );
      }
    }

    return savePatientResponse.data.uuid;
  }

  static async saveRelationships(
    relationships: Array<RelationshipValue>,
    savePatientResponse: FetchResponse,
    abortController: AbortController,
  ) {
    return Promise.all(
      relationships
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
  }

  static async saveObservations(
    obss: Record<string, string>,
    savePatientResponse: FetchResponse,
    currentLocation: string,
    currentUser: Session,
    config: RegistrationConfig,
    abortController: AbortController,
  ) {
    if (Object.keys(obss).length > 0 && config.registrationObs.encounterTypeUuid) {
      const encounterToSave = {
        encounterDatetime: new Date(),
        patient: savePatientResponse.data.uuid,
        encounterType: config.registrationObs.encounterTypeUuid,
        location: currentLocation,
        encounterProviders: [
          {
            provider: currentUser.currentProvider.uuid,
            encounterRole: config.registrationObs.encounterProviderRoleUuid,
          },
        ],
        form: config.registrationObs.registrationFormUuid,
        obs: null, // TODO: transform `obss` into here
      };

      // TODO: fill this in
    }
  }

  static async savePatientIdentifiers(
    isNewPatient: boolean,
    patientUuid: string,
    patientIdentifiers: FormValues['identifiers'], // values.identifiers
    initialIdentifierValues: FormValues['identifiers'], // Initial identifiers assigned to the patient
    location: string,
    abortController: AbortController,
  ): Promise<Array<PatientIdentifier>> {
    let identifierTypeRequests = Object.values(patientIdentifiers).map(async (patientIdentifier) => {
      const {
        identifierTypeUuid,
        identifierValue,
        identifierUuid,
        selectedSource,
        preferred,
        autoGeneration,
        initialValue,
      } = patientIdentifier;
      /* Since default identifier-types will be present on the form and are also in the not-required state,
        therefore we might be running into situations when there's no value and no source associated,
        hence filtering these fields out.
      */
      if (identifierValue || (autoGeneration && selectedSource)) {
        const identifier = !autoGeneration
          ? identifierValue
          : await (
              await generateIdentifier(patientIdentifier.selectedSource.uuid, abortController)
            ).data.identifier;
        const identifierToCreate = {
          uuid: identifierUuid,
          identifier,
          identifierType: identifierTypeUuid,
          location,
          preferred,
        };

        if (!isNewPatient) {
          if (!initialValue) {
            await addPatientIdentifier(patientUuid, identifierToCreate, abortController);
          } else if (initialValue !== identifier) {
            await updatePatientIdentifier(patientUuid, identifierUuid, identifierToCreate.identifier, abortController);
          }
        }

        return identifierToCreate;
      }
    });

    /*
      If there was initially an identifier assigned to the patient, 
      which is now not present in the patientIdentifiers(values.identifiers),
      this means that the identifier is meant to be deleted, hence we need
      to delete the respective identifiers.
    */

    if (patientUuid) {
      Object.keys(initialIdentifierValues)
        .filter((identifierFieldName) => !patientIdentifiers[identifierFieldName])
        .forEach(async (identifierFieldName) => {
          await deletePatientIdentifier(
            patientUuid,
            initialIdentifierValues[identifierFieldName].identifierUuid,
            abortController,
          );
        });
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
        attributes: FormManager.getPatientAttributes(values),
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

  static getPatientAttributes(values: FormValues) {
    const attributes: Array<AttributeValue> = [];
    if (values.attributes) {
      for (const [key, value] of Object.entries(values.attributes)) {
        attributes.push({
          attributeType: key,
          value,
        });
      }
    }
    if (values.unidentifiedPatient) {
      attributes.push({
        // The UUID of the 'Unknown Patient' attribute-type will always be static across all implementations of OpenMRS
        attributeType: '8b56eac7-5c76-4b9c-8c6f-1deab8d3fc47',
        value: 'true',
      });
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
