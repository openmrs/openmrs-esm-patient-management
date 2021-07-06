import React from 'react';
import find from 'lodash/find';
import camelCase from 'lodash/camelCase';
import FormManager from './patient-registration/form-manager';
import { SyncProcessOptions } from '@openmrs/esm-framework';
import { PatientRegistration } from './patient-registration/patient-registration-types';
import { FetchResponse, makeUrl, messageOmrsServiceWorker, openmrsFetch, SessionUser } from '@openmrs/esm-framework';
import { PatientIdentifierType, FetchedPatientIdentifierType } from './patient-registration/patient-registration-types';
import { mockAutoGenerationOptionsResult } from '../__mocks__/autogenerationoptions.mock';

export interface Resources {
  addressTemplate: any;
  currentSession: SessionUser;
  relationshipTypes: any;
  patientIdentifiers: Array<PatientIdentifierType>;
}

export const ResourcesContext = React.createContext<Resources>(null);

export async function fetchCurrentSession(abortController?: AbortController): Promise<FetchResponse<SessionUser>> {
  const url = '/ws/rest/v1/session';
  await cacheUrl(url);
  const { data } = await openmrsFetch('/ws/rest/v1/session', { signal: abortController?.signal });
  return data;
}

export async function fetchAddressTemplate(abortController?: AbortController) {
  const url = '/ws/rest/v1/systemsetting?q=layout.address.format&v=custom:(value)';
  await cacheUrl(url);
  const { data } = await openmrsFetch(url, { signal: abortController?.signal });
  return data;
}

export async function fetchAllRelationshipTypes(abortController?: AbortController) {
  const url = '/ws/rest/v1/relationshiptype?v=default';
  await cacheUrl(url);
  const { data } = await openmrsFetch(url, { signal: abortController?.signal });
  return data;
}

export async function fetchPatientIdentifierTypesWithSources(
  abortController?: AbortController,
): Promise<Array<PatientIdentifierType>> {
  const [primaryIdentifierType, secondaryIdentifierTypes] = await Promise.all([
    fetchPrimaryIdentifierType(abortController),
    fetchSecondaryIdentifierTypes(abortController),
  ]);

  // @ts-ignore Reason: The required props of the type are generated below.
  const identifierTypes: Array<PatientIdentifierType> = [primaryIdentifierType, ...secondaryIdentifierTypes].filter(
    Boolean,
  );

  for (const identifierType of identifierTypes) {
    const [identifierSources, autoGenOptions] = await Promise.all([
      fetchIdentifierSources(identifierType.uuid, abortController),
      fetchAutoGenerationOptions(identifierType.uuid, abortController),
    ]);

    identifierType.identifierSources = identifierSources.data.results.map((source) => {
      const option = find(autoGenOptions.results, { source: { uuid: source.uuid } });
      source.autoGenerationOption = option;
      return source;
    });
  }

  return identifierTypes;
}

async function fetchPrimaryIdentifierType(abortController: AbortController): Promise<FetchedPatientIdentifierType> {
  const metadataUrl = '/ws/rest/v1/metadatamapping/termmapping?v=full&code=emr.primaryIdentifierType';
  await cacheUrl(metadataUrl);
  const primaryIdentifierTypeResponse = await openmrsFetch(metadataUrl, { signal: abortController?.signal });

  const identifierUrl = `/ws/rest/v1/patientidentifiertype/${primaryIdentifierTypeResponse.data.results[0].metadataUuid}`;
  await cacheUrl(identifierUrl);
  const { data: metadata } = await openmrsFetch(identifierUrl, { signal: abortController?.signal });

  return {
    name: metadata.name,
    fieldName: camelCase(metadata.name),
    required: metadata.required,
    uuid: metadata.uuid,
    format: metadata.format,
    isPrimary: true,
  };
}

async function fetchSecondaryIdentifierTypes(
  abortController?: AbortController,
): Promise<Array<FetchedPatientIdentifierType>> {
  const metadataUrl = '/ws/rest/v1/metadatamapping/termmapping?v=full&code=emr.extraPatientIdentifierTypes';
  await cacheUrl(metadataUrl);
  const secondaryIdentifierTypeResponse = await openmrsFetch(metadataUrl, { signal: abortController?.signal });

  if (secondaryIdentifierTypeResponse.data.results) {
    const extraIdentifierTypesSetUuid = secondaryIdentifierTypeResponse.data.results[0].metadataUuid;
    const memberMetadataUrl = `/ws/rest/v1/metadatamapping/metadataset/${extraIdentifierTypesSetUuid}/members`;
    await cacheUrl(memberMetadataUrl);
    const metadataResponse = await openmrsFetch(memberMetadataUrl, { signal: abortController?.signal });

    if (metadataResponse.data.results) {
      return await Promise.all(
        metadataResponse.data.results.map(async (setMember) => {
          const identifierUrl = '/ws/rest/v1/patientidentifiertype/' + setMember.metadataUuid;
          await cacheUrl(identifierUrl);
          const type = await openmrsFetch(identifierUrl, { signal: abortController?.signal });

          return {
            name: type.data.name,
            fieldName: camelCase(type.data.name),
            required: type.data.required,
            uuid: type.data.uuid,
            format: secondaryIdentifierTypeResponse.data.format,
            isPrimary: false,
          };
        }),
      );
    }
  }

  return [];
}

async function fetchIdentifierSources(identifierType: string, abortController?: AbortController) {
  const url = '/ws/rest/v1/idgen/identifiersource?v=full&identifierType=' + identifierType;
  await cacheUrl(url);
  return await openmrsFetch(url, { signal: abortController?.signal });
}

function fetchAutoGenerationOptions(identifierType: string, abortController?: AbortController) {
  // return openmrsFetch('/ws/rest/v1/idgen/autogenerationoption?v=full&identifierType=' + identifierType, {
  //   signal: abortController.signal,
  // });‚
  return Promise.resolve(mockAutoGenerationOptionsResult);
}

async function cacheUrl(url: string) {
  const fullUrl = new URL(makeUrl(url), window.location.origin).href;
  await messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    url: fullUrl,
  });
}

export async function syncPatientRegistration(
  queuedPatient: PatientRegistration,
  options: SyncProcessOptions<PatientRegistration>,
) {
  await FormManager.savePatientFormOnline(
    undefined,
    queuedPatient.formValues,
    queuedPatient.patientUuidMap,
    queuedPatient.initialAddressFieldValues,
    queuedPatient.identifierTypes,
    queuedPatient.capturePhotoProps,
    queuedPatient.patientPhotoConceptUuid,
    queuedPatient.currentLocation,
    queuedPatient.personAttributeSections,
    options.abort,
  );
}
