import React from 'react';
import find from 'lodash-es/find';
import camelCase from 'lodash-es/camelCase';
import escapeRegExp from 'lodash-es/escapeRegExp';
import { getConfig, messageOmrsServiceWorker, openmrsFetch, restBaseUrl, type Session } from '@openmrs/esm-framework';
import type {
  PatientIdentifierType,
  FetchedPatientIdentifierType,
  AddressTemplate,
} from './patient-registration/patient-registration.types';
import { cacheForOfflineHeaders, moduleName } from './constants';

export interface Resources {
  addressTemplate: AddressTemplate;
  currentSession: Session;
  relationshipTypes: any;
  identifierTypes: Array<PatientIdentifierType>;
}

export const ResourcesContext = React.createContext<Resources>(null);

export async function fetchCurrentSession(): Promise<Session> {
  const { data } = await cacheAndFetch<Session>(`${restBaseUrl}/session`);
  return data;
}

export async function fetchAddressTemplate() {
  const { data } = await cacheAndFetch<AddressTemplate>(`${restBaseUrl}/addresstemplate`);
  return data;
}

export async function fetchAllRelationshipTypes() {
  const { data } = await cacheAndFetch(`${restBaseUrl}/relationshiptype?v=default`);
  return data;
}

export async function fetchAllFieldDefinitionTypes() {
  const config = await getConfig(moduleName);

  if (!config.fieldDefinitions) {
    return;
  }

  const fieldDefinitionPromises = config.fieldDefinitions.map((def) => fetchFieldDefinitionType(def));

  const fieldDefinitionResults = await Promise.all(fieldDefinitionPromises);

  const mergedData = fieldDefinitionResults.reduce((merged, result) => {
    if (result) {
      merged.push(result);
    }
    return merged;
  }, []);

  return mergedData;
}

async function fetchFieldDefinitionType(fieldDefinition) {
  let apiUrl = '';

  if (fieldDefinition.type === 'person attribute') {
    apiUrl = `${restBaseUrl}/personattributetype/${fieldDefinition.uuid}`;
  }

  if (fieldDefinition.answerConceptSetUuid) {
    await cacheAndFetch(`${restBaseUrl}/concept/${fieldDefinition.answerConceptSetUuid}`);
  }
  const { data } = await cacheAndFetch(apiUrl);
  return data;
}

export async function fetchPatientIdentifierTypesWithSources(): Promise<Array<PatientIdentifierType>> {
  const patientIdentifierTypes = await fetchPatientIdentifierTypes();

  // @ts-ignore Reason: The required props of the type are generated below.
  const identifierTypes: Array<PatientIdentifierType> = patientIdentifierTypes.filter(Boolean);

  const [autoGenOptions, identifierSourcesResponse] = await Promise.all([
    fetchAutoGenerationOptions(),
    fetchIdentifierSources(),
  ]);

  const allIdentifierSources = identifierSourcesResponse.data.results;

  for (let i = 0; i < identifierTypes?.length; i++) {
    identifierTypes[i].identifierSources = allIdentifierSources.map((source) => {
      const option = find(autoGenOptions.data.results, { source: { uuid: source.uuid } });
      source.autoGenerationOption = option;
      return source;
    });
  }

  return identifierTypes;
}

async function fetchPatientIdentifierTypes(): Promise<Array<FetchedPatientIdentifierType>> {
  const [patientIdentifierTypesResponse, primaryIdentifierTypeResponse] = await Promise.all([
    cacheAndFetch(
      `${restBaseUrl}/patientidentifiertype?v=custom:(display,uuid,name,format,required,uniquenessBehavior)`,
    ),
    cacheAndFetch(`${restBaseUrl}/metadatamapping/termmapping?v=full&code=emr.primaryIdentifierType`),
  ]);

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
    return identifierTypes;
  }

  return [];
}

async function fetchIdentifierSources() {
  return await cacheAndFetch(`${restBaseUrl}/idgen/identifiersource?v=default`);
}

async function fetchAutoGenerationOptions(abortController?: AbortController) {
  return await cacheAndFetch(`${restBaseUrl}/idgen/autogenerationoption?v=full`);
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
