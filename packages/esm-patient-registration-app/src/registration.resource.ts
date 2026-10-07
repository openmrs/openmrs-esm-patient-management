import { camelCase, find } from 'lodash-es';
import { openmrsFetch, restBaseUrl, type Session } from '@openmrs/esm-framework';
import type {
  AddressTemplate,
  FetchedPatientIdentifierType,
  IdentifierSourceAutoGenerationOption,
  PatientIdentifierType,
  RelationshipTypesResponse,
} from './patient-registration/patient-registration.types';

export interface Resources {
  addressTemplate: AddressTemplate;
  currentSession: Session;
  relationshipTypes: RelationshipTypesResponse;
  identifierTypes: Array<PatientIdentifierType>;
}

export async function fetchAddressTemplate() {
  const { data } = await openmrsFetch<AddressTemplate>(`${restBaseUrl}/addresstemplate`);
  return data;
}

export async function fetchAllRelationshipTypes(): Promise<RelationshipTypesResponse> {
  const { data } = await openmrsFetch<RelationshipTypesResponse>(`${restBaseUrl}/relationshiptype?v=default`);
  return data;
}

function isValidFetchedIdentifierType(
  type: FetchedPatientIdentifierType | null | undefined,
): type is FetchedPatientIdentifierType {
  return type !== null && type !== undefined;
}

export async function fetchPatientIdentifierTypesWithSources(): Promise<Array<PatientIdentifierType>> {
  const patientIdentifierTypes = await fetchPatientIdentifierTypes();

  const validIdentifierTypes = patientIdentifierTypes.filter(isValidFetchedIdentifierType);
  // Convert FetchedPatientIdentifierType to PatientIdentifierType
  const identifierTypes: Array<PatientIdentifierType> = validIdentifierTypes.map((type) => ({
    ...type,
    identifierSources: [],
  }));

  const [autoGenOptions, identifierSourcesResponse] = await Promise.all([
    fetchAutoGenerationOptions(),
    fetchIdentifierSources(),
  ]);

  const allIdentifierSources = identifierSourcesResponse.data?.results || [];

  for (let i = 0; i < identifierTypes.length; i++) {
    identifierTypes[i].identifierSources = allIdentifierSources
      .filter((source) => source.identifierType.uuid === identifierTypes[i].uuid)
      .map((source) => {
        const option = find(autoGenOptions.data?.results || [], { source: { uuid: source.uuid } });
        if (option && 'manualEntryEnabled' in option && 'automaticGenerationEnabled' in option) {
          source.autoGenerationOption = option as IdentifierSourceAutoGenerationOption;
        }
        return source;
      });
  }

  return identifierTypes;
}

interface ApiPatientIdentifierType {
  display: string;
  uuid: string;
  name: string;
  format: string;
  formatDescription?: string;
  required: boolean;
  uniquenessBehavior: undefined | null | 'UNIQUE' | 'NON_UNIQUE' | 'LOCATION';
}

async function fetchPatientIdentifierTypes(): Promise<Array<FetchedPatientIdentifierType | null>> {
  const [patientIdentifierTypesResponse, primaryIdentifierTypeResponse] = await Promise.all([
    openmrsFetch<{ results: Array<ApiPatientIdentifierType> }>(
      `${restBaseUrl}/patientidentifiertype?v=custom:(display,uuid,name,format,formatDescription,required,uniquenessBehavior)`,
    ),
    openmrsFetch<{ results: Array<{ metadataUuid: string }> }>(
      `${restBaseUrl}/metadatamapping/termmapping?v=full&code=emr.primaryIdentifierType`,
    ),
  ]);

  if (patientIdentifierTypesResponse.ok) {
    // Primary identifier type is to be kept at the top of the list.
    const patientIdentifierTypes = patientIdentifierTypesResponse?.data?.results || [];

    const primaryIdentifierTypeUuid = primaryIdentifierTypeResponse?.data?.results?.[0]?.metadataUuid;

    const identifierTypes: Array<FetchedPatientIdentifierType | null> = [];

    if (primaryIdentifierTypeResponse?.ok && primaryIdentifierTypeUuid) {
      const primaryType = patientIdentifierTypes.find((type) => type.uuid === primaryIdentifierTypeUuid);
      if (primaryType) {
        identifierTypes.push(mapPatientIdentifierType(primaryType, true));
      }
    }

    patientIdentifierTypes.forEach((type) => {
      if (type.uuid !== primaryIdentifierTypeUuid) {
        identifierTypes.push(mapPatientIdentifierType(type, false));
      }
    });
    return identifierTypes;
  }

  return [];
}

interface IdentifierSourceResponse {
  results: Array<{
    uuid: string;
    name: string;
    identifierType: { uuid: string };
    autoGenerationOption?: IdentifierSourceAutoGenerationOption;
  }>;
}

async function fetchIdentifierSources() {
  return await openmrsFetch<IdentifierSourceResponse>(`${restBaseUrl}/idgen/identifiersource?v=default`);
}

interface AutoGenerationOptionResponse {
  results: Array<IdentifierSourceAutoGenerationOption & { source: { uuid: string } }>;
}

async function fetchAutoGenerationOptions() {
  return await openmrsFetch<AutoGenerationOptionResponse>(`${restBaseUrl}/idgen/autogenerationoption?v=full`);
}

function mapPatientIdentifierType(
  patientIdentifierType: ApiPatientIdentifierType,
  isPrimary: boolean,
): FetchedPatientIdentifierType {
  return {
    name: patientIdentifierType.display,
    fieldName: camelCase(patientIdentifierType.name),
    required: patientIdentifierType.required,
    uuid: patientIdentifierType.uuid,
    format: patientIdentifierType.format,
    formatDescription: patientIdentifierType.formatDescription,
    isPrimary,
    uniquenessBehavior: patientIdentifierType.uniquenessBehavior,
  };
}
