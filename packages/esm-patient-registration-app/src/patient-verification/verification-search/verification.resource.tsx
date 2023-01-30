import useSWR from 'swr';
import { Encounter, Patient } from '../../patient-registration/patient-registration-types';
import { ClientIdentification, ClientRegistryPatient, RegistryPatient } from '../patient-verification-types';
import counties from '../assets/counties.json';
import { FetchResponse, OpenmrsFetchError } from '@openmrs/esm-framework';

const clientRegistryUrl = 'https://dhpstagingapi.health.go.ke/partners/registry';

function setCookie(tokenValue: string) {
  document.cookie = `CRSESSION=${tokenValue};expires=86400;`;
}

function getCookie() {
  const cookies = document.cookie;
  const results = cookies.match(RegExp('CRSESSION' + '=.[^;]*'));
  if (results) {
    const cookie = results[0].split('=');
    return { token: cookie[1] };
  } else {
    const url = `https://dhpidentitystagingapi.health.go.ke/connect/token`;
    const urlencoded = new URLSearchParams();
    urlencoded.append('client_id', 'partner.test.client');
    urlencoded.append('client_secret', 'partnerTestPwd');
    urlencoded.append('grant_type', 'client_credentials');
    urlencoded.append('scope', 'DHP.Gateway DHP.Partners');
    fetch(url, {
      body: urlencoded,
      method: 'POST',
    })
      .then((r) => r.json())
      .then((cookie) => {
        const { access_token } = cookie;
        setCookie(access_token);
        return { token: access_token };
      });
  }
}

const fetcher = (url, token) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((r) => r.json());

export const useSearchClientRegistry = (documentType: string, searchTerm: string) => {
  const cookie = getCookie();
  const url = `${clientRegistryUrl}/search/KE/${documentType}/${searchTerm}`;
  const { data, isLoading, error } = useSWR(documentType && searchTerm ? [url, cookie?.token] : null, ([url, token]) =>
    fetcher(url, token),
  );
  return { patient: data as ClientRegistryPatient, isLoading, error };
};

export function generateClientRegistryPayload(patient: Patient, obs: { [conceptUuid: string]: string }) {
  const { identifiers, person } = patient;
  const identifierPayload: Array<any> = identifiers
    .map((identifier) => {
      if (identifier.identifierType === '49af6cdc-7968-4abb-bf46-de10d7f4859f') {
        return {
          IdentificationType: 'national-id',
          IdentificationNumber: identifier.identifier,
        };
      }
    })
    .filter((identifiers) => identifiers !== undefined);

  const primaryPhoneNumber = person.attributes.find(
    (attribute) => attribute.attributeType === 'b2c38640-2603-4629-aebd-3b54f33f1e3a',
  );
  const secondaryPhoneNumber = person.attributes.find(
    (attribute) => attribute.attributeType === '94614350-84c8-41e0-ac29-86bc107069be',
  );
  const emailAddress = person.attributes.find(
    (attribute) => attribute.attributeType === 'b8d0b331-1d2d-4a9a-b741-1816f498bdb6',
  );

  const clientRegistryPayload: RegistryPatient = {
    clientNumber: '',
    firstName: person.names[0].givenName,
    middleName: person.names[0]?.middleName ?? '',
    lastName: person.names[0].familyName,
    dateOfBirth: person.birthdate,
    maritalStatus: '',
    gender: person.gender === 'M' ? 'male' : 'female',
    occupation: '',
    religion: '',
    educationLevel: '',
    country: 'KE',
    countyOfBirth: person.addresses.at(0).countyDistrict,
    originFacilityKmflCode: '',
    isAlive: !person.dead,
    nascopCCCNumber: '',
    residence: {
      county:
        `0${String(counties.find((country) => country.name === person.addresses.at(0).countyDistrict).code)}` ?? '',
      subCounty: person.addresses.at(0).stateProvince.toLocaleLowerCase(),
      ward: person.addresses.at(0).address4.toLocaleLowerCase(),
      village: person.addresses.at(0).cityVillage,
      landmark: '',
      address: person.addresses.at(0).address1,
    },
    identifications: [...identifierPayload],
    contact: {
      primaryPhone: primaryPhoneNumber?.value,
      secondaryPhone: secondaryPhoneNumber?.value,
      emailAddress: emailAddress?.value,
    },
    nextOfKins: [],
  };
  savePatientToCR(clientRegistryPayload);
  return clientRegistryPayload;
}

export function savePatientToCR<T>(clientRegistryPatient: RegistryPatient, nupi?: string) {
  if (nupi) {
    return Promise.resolve({ status: '300', data: clientRegistryPatient });
  }
  const cookie = getCookie();
  return window
    .fetch(clientRegistryUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cookie?.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientRegistryPatient),
    })
    .then((r) => {
      const response = r as FetchResponse<T>;
      if (response.ok) {
        if (response.status === 204) {
          response.data = null as unknown as T;
          return response;
        } else {
          return response.text().then((responseText) => {
            try {
              if (responseText) {
                response.data = JSON.parse(responseText);
              }
            } catch (err) {}
            return response;
          });
        }
      } else {
        // Attempt to download a response body, if it has one
        return response.text().then(
          (responseText) => {
            let responseBody = responseText;
            try {
              responseBody = JSON.parse(responseText);
            } catch (err) {}
            throw new OpenmrsFetchError(clientRegistryUrl, response, responseBody, new Error());
          },
          (err) => {
            throw new OpenmrsFetchError(clientRegistryUrl, response, null, new Error());
          },
        );
      }
    });
}
