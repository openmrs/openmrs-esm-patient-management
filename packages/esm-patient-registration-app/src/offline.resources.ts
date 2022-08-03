import React from 'react';
import find from 'lodash-es/find';
import camelCase from 'lodash-es/camelCase';
import escapeRegExp from 'lodash-es/escapeRegExp';
import { FetchResponse, messageOmrsServiceWorker, openmrsFetch, Session } from '@openmrs/esm-framework';
import { PatientIdentifierType, FetchedPatientIdentifierType } from './patient-registration/patient-registration-types';
import { cacheForOfflineHeaders } from './constants';

export interface Resources {
  addressTemplate: any;
  currentSession: Session;
  relationshipTypes: any;
  identifierTypes: Array<PatientIdentifierType>;
}

export const ResourcesContext = React.createContext<Resources>(null);

export async function fetchCurrentSession(abortController?: AbortController): Promise<Session> {
  const { data } = await cacheAndFetch<Session>('/ws/rest/v1/session', abortController);
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

async function fetchPatientIdentifierTypes(
  abortController?: AbortController,
): Promise<Array<FetchedPatientIdentifierType>> {
  const patientIdentifierTypesResponse = await cacheAndFetch(
    '/ws/rest/v1/patientidentifiertype?v=full',
    abortController,
  );

  const primaryIdentifierTypeResponse = await cacheAndFetch(
    '/ws/rest/v1/metadatamapping/termmapping?v=full&code=emr.primaryIdentifierType',
    abortController,
  );

  if (patientIdentifierTypesResponse.ok) {
    // Primary identifier type is to be kept at the top of the list.
    const patientIdentifierTypes = patientIdentifierTypesResponse?.data?.results;

    const primaryIdentifierTypeUuid = primaryIdentifierTypeResponse?.data?.results?.[0]?.metadataUuid;

    let identifierTypes = primaryIdentifierTypeResponse?.ok
      ? [
          mapPatientIdentifierType(
            patientIdentifierTypes?.find((type) => type.uuid === primaryIdentifierTypeUuid),
            true,
          ),
        ]
      : [];

    patientIdentifierTypes.forEach((type) => {
      if (type.uuid !== primaryIdentifierTypeUuid) {
        identifierTypes.push(mapPatientIdentifierType(type, false));
      }
    });
    return identifierTypes.map((identifierType) => ({
      ...identifierType,
      fieldName: camelCase(identifierType.name),
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

function mapPatientIdentifierType(patientIdentifierType, isPrimary) {
  return {
    name: patientIdentifierType.display,
    fieldName: camelCase(patientIdentifierType.display),
    required: patientIdentifierType.required,
    uuid: patientIdentifierType.uuid,
    format: patientIdentifierType.format,
    isPrimary,
    uniquenessBehavior: patientIdentifierType.uniquenessBehavior,
  };
}
