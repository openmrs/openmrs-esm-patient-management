import React from 'react';
import find from 'lodash-es/find';
import camelCase from 'lodash-es/camelCase';
import { FetchResponse, openmrsFetch, SessionUser } from '@openmrs/esm-framework';
import { PatientIdentifierType, FetchedPatientIdentifierType } from './patient-registration/patient-registration-types';
import { mockAutoGenerationOptionsResult } from '../__mocks__/autogenerationoptions.mock';
import { cacheForOfflineHeaders } from './constants';

export interface Resources {
  addressTemplate: any;
  currentSession: SessionUser;
  relationshipTypes: any;
  patientIdentifiers: Array<PatientIdentifierType>;
}

export const ResourcesContext = React.createContext<Resources>(null);

export async function fetchCurrentSession(abortController?: AbortController): Promise<FetchResponse<SessionUser>> {
  const { data } = await openmrsFetch('/ws/rest/v1/session', {
    signal: abortController?.signal,
    headers: cacheForOfflineHeaders,
  });
  return data;
}

export async function fetchAddressTemplate(abortController?: AbortController) {
  const { data } = await openmrsFetch('/ws/rest/v1/systemsetting?q=layout.address.format&v=custom:(value)', {
    signal: abortController?.signal,
    headers: cacheForOfflineHeaders,
  });
  return data;
}

export async function fetchAllRelationshipTypes(abortController?: AbortController) {
  const { data } = await openmrsFetch('/ws/rest/v1/relationshiptype?v=default', {
    signal: abortController?.signal,
    headers: cacheForOfflineHeaders,
  });
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
  const primaryIdentifierTypeResponse = await openmrsFetch(
    '/ws/rest/v1/metadatamapping/termmapping?v=full&code=emr.primaryIdentifierType',
    { signal: abortController?.signal, headers: cacheForOfflineHeaders },
  );

  const { data: metadata } = await openmrsFetch(
    `/ws/rest/v1/patientidentifiertype/${primaryIdentifierTypeResponse.data.results[0].metadataUuid}`,
    { signal: abortController?.signal, headers: cacheForOfflineHeaders },
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
  const secondaryIdentifierTypeResponse = await openmrsFetch(
    '/ws/rest/v1/metadatamapping/termmapping?v=full&code=emr.extraPatientIdentifierTypes',
    { signal: abortController?.signal, headers: cacheForOfflineHeaders },
  );

  if (secondaryIdentifierTypeResponse.data.results) {
    const extraIdentifierTypesSetUuid = secondaryIdentifierTypeResponse.data.results[0].metadataUuid;
    const metadataResponse = await openmrsFetch(
      `/ws/rest/v1/metadatamapping/metadataset/${extraIdentifierTypesSetUuid}/members`,
      { signal: abortController?.signal, headers: cacheForOfflineHeaders },
    );

    if (metadataResponse.data.results) {
      return await Promise.all(
        metadataResponse.data.results.map(async (setMember) => {
          const type = await openmrsFetch(`/ws/rest/v1/patientidentifiertype/${setMember.metadataUuid}`, {
            signal: abortController?.signal,
            headers: cacheForOfflineHeaders,
          });

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
  return await openmrsFetch(`/ws/rest/v1/idgen/identifiersource?v=full&identifierType=${identifierType}`, {
    signal: abortController?.signal,
    headers: cacheForOfflineHeaders,
  });
}

function fetchAutoGenerationOptions(identifierType: string, abortController?: AbortController) {
  // return openmrsFetch('/ws/rest/v1/idgen/autogenerationoption?v=full&identifierType=' + identifierType, {
  //   signal: abortController.signal,
  //   headers: cacheForOfflineHeaders,
  // });‚
  return Promise.resolve(mockAutoGenerationOptionsResult);
}
