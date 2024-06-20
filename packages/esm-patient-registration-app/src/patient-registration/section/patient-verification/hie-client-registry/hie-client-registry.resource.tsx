import { type OpenmrsResource, openmrsFetch, restBaseUrl, showModal, showSnackbar } from '@openmrs/esm-framework';
import { type FormValues } from '../../../patient-registration.types';
import useSWRImmutable from 'swr/immutable';

export type HiePayload = {
  firstName: string;
  identificationNumber: string;
  identificationType: string;
};

type HieClientRegistryResponse = fhir.Patient & {
  resourceType: string;
  issue?: Array<{ code: string; diagnostics: string; severity: string }>;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const searchHieClientRegistry = (hiePayload: HiePayload, url): Promise<HieClientRegistryResponse> => {
  return fetcher(url);
};

export const useIdenfierTypes = () => {
  const { isLoading, data, error } = useSWRImmutable<{ data: { results: Array<OpenmrsResource> } }>(
    `${restBaseUrl}/patientidentifiertype`,
    openmrsFetch,
  );

  return {
    patientIdentifierTypes: data?.data.results ?? [],
    isLoading,
    error,
  };
};

export const handleSearchSuccess = (fhirPatient: HieClientRegistryResponse, updateRegistrationInitialValues, t) => {
  if (fhirPatient.resourceType !== 'Patient') {
    showSnackbar({
      kind: 'error',
      title: t('searchFailed', 'Search failed'),
      timeoutInMs: 5000,
      isLowContrast: true,
      subtitle: fhirPatient.issue?.[0]?.diagnostics ?? t('noPatientFound', 'No patient found'),
    });
    return;
  }
  // TODO: handle mapping of FHIR Patient Identifer to OpenMRS Patient Identifier

  // TODO: handle empty state of FHIR Patient

  const openmrsPatient: Partial<FormValues> = {
    givenName: fhirPatient.name[0].given[0],
    familyName: fhirPatient.name[0].family,
    birthdate: fhirPatient.birthDate,
    gender: fhirPatient.gender,
  };
  const dispose = showModal('hei-confirmation-modal', {
    patient: fhirPatient,
    close: () => dispose(),
    onConfirm: () => {
      updateRegistrationInitialValues((prevState: FormValues) => ({ ...prevState, ...openmrsPatient }));
      dispose();
    },
  });
};

export const handleSearchError = (error: any, t) => {
  showSnackbar({
    kind: 'error',
    title: t('searchFailed', 'Search failed'),
    timeoutInMs: 5000,
    subtitle: error?.message ?? '',
  });
};
