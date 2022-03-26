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
  const patientIdentifierTypes = await fetchPatientIdentifierTypes(abortController);

  // @ts-ignore Reason: The required props of the type are generated below.
  const identifierTypes: Array<PatientIdentifierType> = patientIdentifierTypes.filter(Boolean);

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

// async function fetchPrimaryIdentifierType(abortController: AbortController): Promise<FetchedPatientIdentifierType> {
//   const primaryIdentifierTypeResponse = await cacheAndFetch(
//     '/ws/rest/v1/metadatamapping/termmapping?v=full&code=emr.primaryIdentifierType',
//     abortController,
//   );

//   const { data } = await cacheAndFetch<FetchedPatientIdentifierType>(
//     `/ws/rest/v1/patientidentifiertype/${primaryIdentifierTypeResponse.data.results[0].metadataUuid}`,
//     abortController,
//   );

//   return {
//     name: data.name,
//     fieldName: camelCase(data.name),
//     required: data.required,
//     uuid: data.uuid,
//     format: data.format,
//     isPrimary: true,
//     uniquenessBehavior: data.uniquenessBehavior,
//   };
// }

async function fetchPatientIdentifierTypes(
  abortController?: AbortController,
): Promise<Array<FetchedPatientIdentifierType>> {
  const patientIdentifierTypesResponse = await cacheAndFetch(
    '/ws/rest/v1/patientidentifiertype?v=full',
    abortController,
  );

  if (patientIdentifierTypesResponse.ok) {
    return patientIdentifierTypesResponse.data.results.map((type) => ({
      name: type.display,
      fieldName: camelCase(type.display),
      required: type.required,
      uuid: type.uuid,
      format: type.format,
      isPrimary: type.required,
      uniquenessBehavior: type.uniquenessBehavior,
    }));
  }

  return [];
}

async function fetchIdentifierSources(identifierType: string, abortController?: AbortController) {
  return await cacheAndFetch(
    `/ws/rest/v1/idgen/identifiersource?v=default&identifierType=${identifierType}`,
    abortController,
  );
}

async function fetchAutoGenerationOptions(abortController?: AbortController) {
  return await cacheAndFetch(`/ws/rest/v1/idgen/autogenerationoption?v=full`, abortController);
}

async function cacheAndFetch<T = any>(url: string, abortController?: AbortController) {
  await messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: escapeRegExp(url),
  });

  return await openmrsFetch<T>(url, { headers: cacheForOfflineHeaders, signal: abortController?.signal });
}
