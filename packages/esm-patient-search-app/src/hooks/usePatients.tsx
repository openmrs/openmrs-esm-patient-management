import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { PatientSearchConfig } from '../config-schema';
import { Patient } from '../types';

const customRepresentation =
  'custom:(patientId,uuid,identifiers,display,' +
  'patientIdentifier:(uuid,identifier),' +
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
  'attributes:(value,attributeType:(name)))';
/**
 * React hook that performs a search for patient matching search term and returns
 * an Array of patients {@link Array<SearchedPatient>}
 * @param searchTerm Search terms can either be patient identifier or patient name
 * @returns Array of patients matching the search term, loading status and error object
 */
export const usePatients = (searchTerm: string) => {
  const { includeDead } = useConfig() as PatientSearchConfig;
  const url = `/ws/rest/v1/patient?q=${searchTerm}&v=${customRepresentation}&includeDead=${includeDead}`;
  const { data, error } = useSWR<{ data: { results: Array<Patient> } }>(searchTerm ? url : null, openmrsFetch);

  const patients = useMemo(
    () => data?.data?.results.map((patient, index) => ({ ...patient, index: index + 1 })),
    [data?.data?.results, searchTerm],
  );

  return {
    isLoading: !data && !error,
    patients: patients ?? [],
    error: error,
  };
};
