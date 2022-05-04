import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { Patient, Relationship, PatientIdentifier } from './patient-registration-types';

function dataURItoFile(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  // write the bytes of the string to a typed array
  const buffer = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    buffer[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([buffer], { type: mimeString });
  return new File([blob], 'patient-photo.png');
}

export function savePatient(abortController: AbortController, patient: Patient, updatePatientUuid?: string) {
  return openmrsFetch(`/ws/rest/v1/patient/${updatePatientUuid ?? ''}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: patient,
    signal: abortController.signal,
  });
}

export function generateIdentifier(source: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/idgen/identifiersource/${source}/identifier`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {},
    signal: abortController.signal,
  });
}

export function deletePersonName(nameUuid: string, personUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/person/${personUuid}/name/${nameUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}

export function saveRelationship(abortController: AbortController, relationship: Relationship) {
  return openmrsFetch('/ws/rest/v1/relationship', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: relationship,
    signal: abortController.signal,
  });
}

export function updateRelationship(
  abortController: AbortController,
  relationshipUuid,
  relationship: { relationshipType: string },
) {
  return openmrsFetch(`/ws/rest/v1/relationship/${relationshipUuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: { relationshipType: relationship.relationshipType },
    signal: abortController.signal,
  });
}

export function deleteRelationship(abortController: AbortController, relationshipUuid) {
  return openmrsFetch(`/ws/rest/v1/relationship/${relationshipUuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
    signal: abortController.signal,
  });
}

export async function savePatientPhoto(
  patientUuid: string,
  content: string,
  url: string,
  date: string,
  conceptUuid: string,
  abortController: AbortController,
) {
  const formData = new FormData();
  formData.append('patient', patientUuid);
  formData.append('file', dataURItoFile(content));
  formData.append(
    'json',
    JSON.stringify({
      person: patientUuid,
      concept: conceptUuid,
      groupMembers: [],
      obsDatetime: date,
    }),
  );

  return openmrsFetch(url, {
    method: 'POST',
    signal: abortController.signal,
    body: formData,
  });
}

interface ObsFetchResponse {
  results: Array<PhotoObs>;
}

interface PhotoObs {
  display: string;
  obsDatetime: string;
  uuid: string;
  value: {
    display: string;
    links: {
      rel: string;
      uri: string;
    };
  };
}

interface UsePatientPhotoResult {
  data: { dateTime: string; imageSrc: string } | null;
  isError: Error;
  isLoading: boolean;
}

export function usePatientPhoto(patientUuid: string): UsePatientPhotoResult {
  const {
    concepts: { patientPhotoUuid },
  } = useConfig();
  const url = `/ws/rest/v1/obs?patient=${patientUuid}&concept=${patientPhotoUuid}&v=full`;

  const { data, error } = useSWR<{ data: ObsFetchResponse }, Error>(patientUuid ? url : null, openmrsFetch);

  const item = data?.data?.results[0];

  return {
    data: item
      ? {
          dateTime: item?.obsDatetime,
          imageSrc: item?.value?.links?.uri,
        }
      : null,
    isError: error,
    isLoading: !data && !error,
  };
}

export async function fetchPerson(query: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/person?q=${query}`, {
    signal: abortController.signal,
  });
}

export async function addPatientIdentifier(
  patientUuid: string,
  patientIdentifier: PatientIdentifier,
  abortController: AbortController,
) {
  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}/identifier/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: patientIdentifier,
  });
}

export async function updatePatientIdentifier(
  patientUuid: string,
  identifierUuid: string,
  identifier: string,
  abortController: AbortController,
) {
  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}/identifier/${identifierUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: { identifier },
  });
}

export async function deletePatientIdentifier(
  patientUuid: string,
  patientIdentifierUuid: string,
  abortController: AbortController,
) {
  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}/identifier/${patientIdentifierUuid}?purge`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}
