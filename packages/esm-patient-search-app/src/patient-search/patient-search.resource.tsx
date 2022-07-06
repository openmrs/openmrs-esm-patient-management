import useSWRInfinite from 'swr/infinite';
import {
  fetchCurrentPatient,
  FetchResponse,
  getDynamicOfflineDataEntries,
  getSynchronizationItems,
  openmrsFetch,
  useConnectivity,
} from '@openmrs/esm-framework';
import { useCallback, useMemo } from 'react';
import { SearchedPatient } from '../types';

interface PatientSearchResponse {
  data?: Array<SearchedPatient>;
  isLoading: boolean;
  fetchError: Error;
  loadingNewData: boolean;
  hasMore: boolean;
  setPage: (size: number | ((_size: number) => number)) => Promise<Array<PatientFetchResponse>>;
}

type PatientFetchResponse = FetchResponse<{ results: Array<SearchedPatient>; links: Array<{ rel: 'prev' | 'next' }> }>;

export function usePatientSearch(
  searchTerm: string,
  customRepresentation: string,
  includeDead: boolean,
  searching: boolean = true,
): PatientSearchResponse {
  const resultsToFetch = 15;
  const isOnline = useConnectivity();
  const getUrl = useCallback(
    (page: number, prevPageData?: PatientFetchResponse) => {
      if (prevPageData && !prevPageData?.data?.links.some((link) => link.rel === 'next')) {
        return null;
      }
      let url = `/ws/rest/v1/patient?q=${searchTerm}&v=${customRepresentation}&includeDead=${includeDead}&limit=${resultsToFetch}`;
      if (page) {
        url += `&startIndex=${page * resultsToFetch}`;
      }
      return url;
    },
    [searchTerm, customRepresentation, includeDead, resultsToFetch],
  );
  const offlineFetcher = useCallback(() => fetchOfflinePatients(searchTerm, includeDead), [searchTerm, includeDead]);
  const { data, isValidating, setSize, error } = useSWRInfinite<PatientFetchResponse, Error>(
    searching ? getUrl : null,
    isOnline ? openmrsFetch : offlineFetcher,
  );

  return useMemo(
    () => ({
      data: data ? [].concat(...data?.map((resp) => resp?.data?.results)) : null,
      isLoading: !data && !error,
      fetchError: error,
      hasMore: data?.length ? !!data[data.length - 1].data?.links?.some((link) => link.rel === 'next') : false,
      loadingNewData: isValidating,
      setPage: setSize,
    }),
    [data, isValidating, error, setSize],
  );
}

async function fetchOfflinePatients(searchTerm: string, includeDead: boolean): Promise<PatientFetchResponse> {
  const offlineRegisteredPatientSyncItems = await getSynchronizationItems<{ fhirPatient?: fhir.Patient }>(
    'patient-registration',
  );

  const offlinePatientsEntries = await getDynamicOfflineDataEntries('patient');
  const offlinePatients = await Promise.all(
    offlinePatientsEntries.map((entry) => fetchCurrentPatient(entry.identifier)),
  );
  const allKnownPatients = [
    ...offlineRegisteredPatientSyncItems.map((item) => item.fhirPatient),
    ...offlinePatients.map((fetchPatientResult) => fetchPatientResult.data),
  ];
  const matchingPatients = allKnownPatients.filter(
    (patient) =>
      patient && patientMatchesSearchTerm(patient, searchTerm) && (includeDead ? true : !patient.deceasedBoolean),
  );

  return {
    data: {
      results: matchingPatients.map(fhirPatientToSearchedPatient),
      links: [] as Array<any>,
    },
  } as PatientFetchResponse;
}

function patientMatchesSearchTerm(patient: fhir.Patient, searchTerm: string) {
  const matchableStrings = [
    ...(patient.name?.map((name) => name.family) ?? []),
    ...(patient.name?.flatMap((name) => name.given) ?? []),
    ...(patient.identifier?.map((identifier) => identifier.value) ?? []),
    // TODO: If necessary, expand this list with searchable patient data.
  ].filter((value) => typeof value === 'string');

  return matchableStrings.some((str) => str.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()));
}

function fhirPatientToSearchedPatient(patient: fhir.Patient): SearchedPatient {
  // Patients accessed offline are in the FHIR format.
  // This module expects the REST structure, requiring us to make a FHIR->REST conversion.
  // This is based upon the reversed code here:
  // https://github.com/openmrs/openmrs-esm-patient-management/blob/e54fbb473aaccf6bbc0b89a2e3d5db22e04e1c4c/packages/esm-patient-search-app/src/patient-search-result/patient-search-result.component.tsx#L81
  //
  // TODO: If/When the online patient search is migrated to the FHIR API at some point, this entire conversion
  // can be deleted.
  const name = patient.name?.[0];
  const preferredAddress = patient.address?.[0];

  return {
    uuid: patient.id,
    person: {
      personName: {
        givenName: name?.given?.[0],
        middleName: name?.given?.[1],
        familyName: name?.family,
      },
      addresses: preferredAddress
        ? [
            {
              preferred: true,
              cityVillage: preferredAddress.city,
              country: preferredAddress.country,
              postalCode: preferredAddress.postalCode,
              stateProvince: preferredAddress.state,
            },
          ]
        : [],
      birthdate: patient.birthDate,
      deathDate: patient.deceasedDateTime,
      death: patient.deceasedBoolean,
      gender: patient.gender,
    },
    patientIdentifier: {
      identifier: patient.identifier?.[0]?.value,
    },
    attributes:
      patient.telecom?.map((x) => ({
        value: x.value,
        attributeType: { name: 'Telephone Number' },
      })) ?? [],
  };
}
