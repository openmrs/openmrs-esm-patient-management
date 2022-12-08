import { getConfig, OpenmrsFetchError } from '@openmrs/esm-framework';

export async function pushNewPatientToMPI(patient: fhir.Patient) {
  // validate is new patient

  const mpiPatient = await mpiFetch('Patient', 'POST', patient);
  console.log({ mpiPatient });
}

/**
 * Makes sure MPI patient record assigned Identifier(s) are synched with the EMR record
 *
 * @param patient
 */
export function harmonizePatientIdentifiers(patient: fhir.Patient) {}

async function mpiFetch(
  relativePath: string,
  action: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any,
  abortController?: AbortController,
) {
  console.log('Preparing for fetch operation');
  const { baseURL, headers } = await setupConnectionSettings();
  const requestStacktrace = new Error();
  let jsonBody;
  if (body && typeof body === 'object') {
    jsonBody = JSON.stringify(body);
  }
  const response = await window.fetch(baseURL + relativePath, {
    method: action,
    headers,
    body: jsonBody,
    signal: abortController?.signal,
  });
  if (response.ok) {
    if (response.status === 204) {
      // empty response
      return null;
    } else {
      // HTTP 200s - The request succeeded
      return response.text().then((responseText) => {
        try {
          if (responseText) {
            return JSON.parse(responseText);
          }
        } catch (err) {}
        return response;
      });
    }
  } else {
    throw new OpenmrsFetchError(baseURL + relativePath, response, null, requestStacktrace);
  }
}

async function setupConnectionSettings() {
  console.log('Preparing connection settings');
  const { MPI } = await getConfig('@openmrs/esm-patient-registration-app');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${MPI.accessToken}`,
  };
  return { headers, baseURL: `${MPI.host}${MPI.basePath}` };
}

export interface ConnectionSettings {
  host: string;
  accessToken: string;
  accessTokenType: string;
  basePath: string;
}
