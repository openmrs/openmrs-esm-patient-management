import React from 'react';
import find from 'lodash-es/find';
import camelCase from 'lodash-es/camelCase';
import escapeRegExp from 'lodash-es/escapeRegExp';
import { messageOmrsServiceWorker, openmrsFetch, Session } from '@openmrs/esm-framework';
import type {
  PatientIdentifierType,
  FetchedPatientIdentifierType,
  AddressTemplate,
} from './patient-registration/patient-registration.types';
import { cacheForOfflineHeaders } from './constants';

export interface Resources {
  addressTemplate: AddressTemplate;
  currentSession: Session;
  relationshipTypes: any;
  identifierTypes: Array<PatientIdentifierType>;
}

export const ResourcesContext = React.createContext<Resources>(null);

export async function fetchCurrentSession(): Promise<Session> {
  const { data } = await cacheAndFetch<Session>('/ws/rest/v1/session');
  return data;
}

export async function fetchAddressTemplate() {
  const { data } = await cacheAndFetch<AddressTemplate>('/ws/rest/v1/addresstemplate');
  return data;
}

export async function fetchAllRelationshipTypes() {
  const { data } = await cacheAndFetch('/ws/rest/v1/relationshiptype?v=default');
  return data;
}

export async function fetchPatientIdentifierTypesWithSources(): Promise<Array<PatientIdentifierType>> {
  const patientIdentifierTypes = await fetchPatientIdentifierTypes();

  // @ts-ignore Reason: The required props of the type are generated below.
  const identifierTypes: Array<PatientIdentifierType> = patientIdentifierTypes.filter(Boolean);

  const [autoGenOptions, ...allIdentifierSources] = await Promise.all([
    fetchAutoGenerationOptions(),
    ...identifierTypes.map((identifierType) => fetchIdentifierSources(identifierType.uuid)),
  ]);

  for (let i = 0; i < identifierTypes?.length; i++) {
    identifierTypes[i].identifierSources = allIdentifierSources[i].data.results.map((source) => {
      const option = find(autoGenOptions.data.results, { source: { uuid: source.uuid } });
      source.autoGenerationOption = option;
      return source;
    });
  }

  return identifierTypes;
}

async function fetchPatientIdentifierTypes(): Promise<Array<FetchedPatientIdentifierType>> {
  const [patientIdentifierTypesResponse, primaryIdentifierTypeResponse] = await Promise.all([
    cacheAndFetch('/ws/rest/v1/patientidentifiertype?v=custom:(display,uuid,name,format,required,uniquenessBehavior)'),
    cacheAndFetch('/ws/rest/v1/metadatamapping/termmapping?v=full&code=emr.primaryIdentifierType'),
  ]);

  if (patientIdentifierTypesResponse.ok) {
    // Primary identifier type is to be kept at the top of the list.
    const patientIdentifierTypes = patientIdentifierTypesResponse?.data?.results;

    const primaryIdentifierTypeUuid = primaryIdentifierTypeResponse?.data?.results?.[0]?.metadataUuid;

    let identifierTypes = [];

    patientIdentifierTypes.forEach((type) => {
      if (type.uuid !== primaryIdentifierTypeUuid) {
        identifierTypes.push(mapPatientIdentifierType(type, false));
      }
    });
    return identifierTypes;
  }

  return [];
}

async function fetchIdentifierSources(identifierType: string) {
  return await cacheAndFetch(`/ws/rest/v1/idgen/identifiersource?v=default&identifierType=${identifierType}`);
}

async function fetchAutoGenerationOptions(abortController?: AbortController) {
  return await cacheAndFetch(`/ws/rest/v1/idgen/autogenerationoption?v=full`);
}

async function cacheAndFetch<T = any>(url?: string) {
  const abortController = new AbortController();

  await messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: escapeRegExp(url),
  });

  return await openmrsFetch<T>(url, { headers: cacheForOfflineHeaders, signal: abortController?.signal });
}

function mapPatientIdentifierType(patientIdentifierType, isPrimary) {
  return {
    name: patientIdentifierType.display,
    fieldName: camelCase(patientIdentifierType.name),
    required: patientIdentifierType.required,
    uuid: patientIdentifierType.uuid,
    format: patientIdentifierType.format,
    isPrimary,
    uniquenessBehavior: patientIdentifierType.uniquenessBehavior,
  };
}
