import React from 'react';
import find from 'lodash-es/find';
import camelCase from 'lodash-es/camelCase';
import escapeRegExp from 'lodash-es/escapeRegExp';
import { FetchResponse, messageOmrsServiceWorker, openmrsFetch, SessionUser } from '@openmrs/esm-framework';
import { PatientIdentifierType, FetchedPatientIdentifierType } from './patient-registration/patient-registration-types';
import { cacheForOfflineHeaders } from './constants';

export interface Resources {
  addressTemplate: any;
  currentSession: SessionUser;
  relationshipTypes: any;
  identifierTypes: Array<PatientIdentifierType>;
}

export const ResourcesContext = React.createContext<Resources>(null);

export async function fetchCurrentSession(abortController?: AbortController): Promise<FetchResponse<SessionUser>> {
  const { data } = await cacheAndFetch('/ws/rest/v1/session', abortController);
  return data;
}

export async function fetchAddressTemplate(abortController?: AbortController) {
  const { data } = await cacheAndFetch(
    '/ws/rest/v1/systemsetting?q=layout.address.format&v=custom:(value)',
    abortController,
  );
  return data;
}

export async function fetchAllRelationshipTypes(abortController?: AbortController) {
  const { data } = await cacheAndFetch('/ws/rest/v1/relationshiptype?v=default', abortController);
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
      fetchAutoGenerationOptions(abortController),
    ]);

    identifierType.identifierSources = identifierSources.data.results.map((source) => {
      const option = find(autoGenOptions.data.results, { source: { uuid: source.uuid } });
      source.autoGenerationOption = option;
      return source;
    });
  }

  return identifierTypes;
}

async function fetchPrimaryIdentifierType(abortController: AbortController): Promise<FetchedPatientIdentifierType> {
  const primaryIdentifierTypeResponse = await cacheAndFetch(
    '/ws/rest/v1/metadatamapping/termmapping?v=full&code=emr.primaryIdentifierType',
    abortController,
  );

  const { data: metadata } = await cacheAndFetch(
    `/ws/rest/v1/patientidentifiertype/${primaryIdentifierTypeResponse.data.results[0].metadataUuid}`,
    abortController,
  );

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
  const secondaryIdentifierTypeResponse = await cacheAndFetch(
    '/ws/rest/v1/metadatamapping/termmapping?v=full&code=emr.extraPatientIdentifierTypes',
    abortController,
  );

  if (secondaryIdentifierTypeResponse.data.results) {
    const extraIdentifierTypesSetUuid = secondaryIdentifierTypeResponse.data.results[0].metadataUuid;
    const metadataResponse = await cacheAndFetch(
      `/ws/rest/v1/metadatamapping/metadataset/${extraIdentifierTypesSetUuid}/members`,
      abortController,
    );

    if (metadataResponse.data.results) {
      return await Promise.all(
        metadataResponse.data.results.map(async (setMember) => {
          const type = await cacheAndFetch(
            `/ws/rest/v1/patientidentifiertype/${setMember.metadataUuid}`,
            abortController,
          );

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
  return await cacheAndFetch(
    `/ws/rest/v1/idgen/identifiersource?v=full&identifierType=${identifierType}`,
    abortController,
  );
}

async function fetchAutoGenerationOptions(abortController?: AbortController) {
  return await cacheAndFetch(`/ws/rest/v1/idgen/autogenerationoption?v=full`, abortController);
}

async function cacheAndFetch(url: string, abortController?: AbortController) {
  await messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: escapeRegExp(url),
  });

  return await openmrsFetch(url, { headers: cacheForOfflineHeaders, signal: abortController?.signal });
}
