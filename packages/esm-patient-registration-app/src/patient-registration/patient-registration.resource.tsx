import { openmrsFetch } from '@openmrs/esm-framework';
import { Patient, Relationship } from './patient-registration-types';

export const uuidIdentifier = '05a29f94-c0ed-11e2-94be-8c13b969e334';
export const uuidTelephoneNumber = '14d4f066-15f5-102d-96e4-000c29c2a5d7';

export function savePatient(abortController: AbortController, patient: Patient, patientUuid: string) {
  const url = patientUuid ? '/ws/rest/v1/patient/' + patientUuid : '/ws/rest/v1/patient/';
  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: patient,
    signal: abortController.signal,
  });
}

export function generateIdentifier(source: string, abortController: AbortController) {
  return openmrsFetch('/ws/rest/v1/idgen/identifiersource/' + source + '/identifier', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {},
    signal: abortController.signal,
  });
}

export function deletePersonName(nameUuid: string, personUuid: string, abortController: AbortController) {
  return openmrsFetch('/ws/rest/v1/person/' + personUuid + '/name/' + nameUuid, {
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

export async function savePatientPhoto(
  patientUuid: string,
  file: File,
  fileCaption: string,
  abortController: AbortController,
  base64Content: string,
  url: string,
  obsDatetime: string,
  concept: string,
) {
  const formData = new FormData();
  formData.append('fileCaption', fileCaption);
  formData.append('patient', patientUuid);
  if (base64Content) {
    formData.append('file', dataURItoFile(base64Content));
  } else {
    formData.append('file', file);
  }
  const json = {
    person: patientUuid,
    concept: concept,
    groupMembers: [],
    obsDatetime: obsDatetime,
  };
  formData.append('json', JSON.stringify(json));

  return openmrsFetch(url, {
    method: 'POST',
    signal: abortController.signal,
    body: formData,
  });
}

export async function fetchPatientPhotoUrl(
  patientUuid: string,
  concept: string,
  abortController: AbortController,
): Promise<string> {
  const { data } = await openmrsFetch(`/ws/rest/v1/obs?patient=${patientUuid}&concept=${concept}&v=full`, {
    method: 'GET',
    signal: abortController.signal,
  });
  if (data.results.length) {
    return data.results[0].value.links.uri;
  } else {
    return null;
  }
}

export async function fetchPerson(query: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/person?q=${query}`, {
    signal: abortController.signal,
  });
}

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
