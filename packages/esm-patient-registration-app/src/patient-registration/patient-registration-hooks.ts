import { FetchResponse, getSynchronizationItems, openmrsFetch, usePatient } from '@openmrs/esm-framework';
import camelCase from 'lodash-es/camelCase';
import { Dispatch, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { v4 } from 'uuid';
import { patientRegistration } from '../constants';
import {
  FormValues,
  PatientRegistration,
  PatientUuidMapType,
  PersonAttributeResponse,
  PatientIdentifierResponse,
} from './patient-registration-types';
import {
  getAddressFieldValuesFromFhirPatient,
  getFormValuesFromFhirPatient,
  getPatientUuidMapFromFhirPatient,
  getPhonePersonAttributeValueFromFhirPatient,
} from './patient-registration-utils';
import { useInitialPatientRelationships } from './section/patient-relationships/relationships.resource';
import { clientRegistryStore } from '../patient-verification/patient-verification-helper';

export function useInitialFormValues(patientUuid: string): [FormValues, Dispatch<FormValues>] {
  const defaultValues = {
    patientUuid: v4(),
    givenName: '',
    middleName: '',
    familyName: '',
    unidentifiedPatient: false,
    additionalGivenName: '',
    additionalMiddleName: '',
    additionalFamilyName: '',
    addNameInLocalLanguage: false,
    gender: '',
    birthdate: null,
    yearsEstimated: null,
    monthsEstimated: 0,
    birthdateEstimated: false,
    telephoneNumber: '',
    isDead: false,
    deathDate: '',
    deathCause: '',
    relationships: [],
    identifiers: {},
    address: {},
  };
  const { clientRegistryInitialValues, clientExists } = useClientRegistryIntialValues();
  const { isLoading: isLoadingPatientToEdit, patient: patientToEdit } = usePatient(patientUuid);
  const { data: attributes, isLoading: isLoadingAttributes } = useInitialPersonAttributes(patientUuid);
  const { data: identifiers, isLoading: isLoadingIdentifiers } = useInitialPatientIdentifiers(patientUuid);
  const { data: relationships, isLoading: isLoadingRelationships } = useInitialPatientRelationships(patientUuid);
  const [initialFormValues, setInitialFormValues] = useState<FormValues>(
    clientExists ? clientRegistryInitialValues : defaultValues,
  );

  useEffect(() => {
    (async () => {
      if (patientToEdit) {
        setInitialFormValues({
          ...initialFormValues,
          ...getFormValuesFromFhirPatient(patientToEdit),
          address: getAddressFieldValuesFromFhirPatient(patientToEdit),
          ...getPhonePersonAttributeValueFromFhirPatient(patientToEdit),
        });
      } else if (!isLoadingPatientToEdit && patientUuid) {
        const registration = await getPatientRegistration(patientUuid);

        if (!registration._patientRegistrationData.formValues) {
          console.error(
            `Found a queued offline patient registration for patient ${patientUuid}, but without form values. Not using these values.`,
          );
          return;
        }

        setInitialFormValues(registration._patientRegistrationData.formValues);
      }
    })();
  }, [isLoadingPatientToEdit, patientToEdit, patientUuid]);

  // Set initial patient relationships
  useEffect(() => {
    if (!isLoadingRelationships && relationships) {
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        relationships,
      }));
    }
  }, [isLoadingRelationships, relationships, setInitialFormValues]);

  // Set Initial patient identifiers
  useEffect(() => {
    if (!isLoadingIdentifiers && identifiers) {
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        identifiers,
      }));
    }
  }, [isLoadingIdentifiers, identifiers, setInitialFormValues]);

  // Set Initial person attributes
  useEffect(() => {
    if (!isLoadingAttributes && attributes) {
      const intialIdentifiers = {
        'b8d0b331-1d2d-4a9a-b741-1816f498bdb6': 'email@gmail.com',
        '27573398-4651-4ce5-89d8-abec5998165c': 'Nearest health center',
        'b2c38640-2603-4629-aebd-3b54f33f1e3a': '0717417867', //primary phone number
        '94614350-84c8-41e0-ac29-86bc107069be': '0727417867',
      };
      let personAttributes = { ...intialIdentifiers };
      attributes.forEach((attribute) => {
        personAttributes[attribute.attributeType.uuid] = attribute.value;
      });
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        attributes: personAttributes,
      }));
    }
  }, [attributes, setInitialFormValues, isLoadingAttributes]);

  return [initialFormValues, setInitialFormValues];
}

export function useInitialAddressFieldValues(patientUuid: string, fallback = {}): [object, Dispatch<object>] {
  const { isLoading, patient } = usePatient(patientUuid);
  const [initialAddressFieldValues, setInitialAddressFieldValues] = useState<object>(fallback);

  useEffect(() => {
    (async () => {
      if (patient) {
        setInitialAddressFieldValues({
          ...initialAddressFieldValues,
          address: getAddressFieldValuesFromFhirPatient(patient),
        });
      } else if (!isLoading && patientUuid) {
        const registration = await getPatientRegistration(patientUuid);
        setInitialAddressFieldValues(registration?._patientRegistrationData.initialAddressFieldValues ?? fallback);
      }
    })();
  }, [isLoading, patient, patientUuid]);

  return [initialAddressFieldValues, setInitialAddressFieldValues];
}

export function usePatientUuidMap(
  patientUuid: string,
  fallback: PatientUuidMapType = {},
): [PatientUuidMapType, Dispatch<PatientUuidMapType>] {
  const { isLoading: isLoadingPatientToEdit, patient: patientToEdit } = usePatient(patientUuid);
  const [patientUuidMap, setPatientUuidMap] = useState(fallback);

  useEffect(() => {
    if (patientToEdit) {
      setPatientUuidMap({ ...patientUuidMap, ...getPatientUuidMapFromFhirPatient(patientToEdit) });
    } else if (!isLoadingPatientToEdit && patientUuid) {
      getPatientRegistration(patientUuid).then((registration) =>
        setPatientUuidMap(registration?._patientRegistrationData.initialAddressFieldValues ?? fallback),
      );
    }
  }, [isLoadingPatientToEdit, patientToEdit, patientUuid]);

  return [patientUuidMap, setPatientUuidMap];
}

async function getPatientRegistration(patientUuid: string) {
  const items = await getSynchronizationItems<PatientRegistration>(patientRegistration);
  return items.find((item) => item._patientRegistrationData.formValues.patientUuid === patientUuid);
}

export function useInitialPatientIdentifiers(patientUuid: string): {
  data: FormValues['identifiers'];
  isLoading: boolean;
} {
  const shouldFetch = !!patientUuid;

  const { data, error } = useSWR<FetchResponse<{ results: Array<PatientIdentifierResponse> }>, Error>(
    shouldFetch
      ? `/ws/rest/v1/patient/${patientUuid}/identifier?v=custom:(uuid,identifier,identifierType:(uuid,required,name),preferred)`
      : null,
    openmrsFetch,
  );

  const result: {
    data: FormValues['identifiers'];
    isLoading: boolean;
  } = useMemo(() => {
    const identifiers: FormValues['identifiers'] = {};

    data?.data?.results?.forEach((patientIdentifier) => {
      identifiers[camelCase(patientIdentifier.identifierType.name)] = {
        identifierUuid: patientIdentifier.uuid,
        preferred: patientIdentifier.preferred,
        initialValue: patientIdentifier.identifier,
        identifierValue: patientIdentifier.identifier,
        identifierTypeUuid: patientIdentifier.identifierType.uuid,
        identifierName: patientIdentifier.identifierType.name,
        required: patientIdentifier.identifierType.required,
        selectedSource: null,
        autoGeneration: false,
      };
    });
    return {
      data: identifiers,
      isLoading: !data && !error,
    };
  }, [data, error]);

  return result;
}

function useInitialPersonAttributes(personUuid: string) {
  const shouldFetch = !!personUuid;
  const { data, error } = useSWR<FetchResponse<{ results: Array<PersonAttributeResponse> }>, Error>(
    shouldFetch ? `/ws/rest/v1/person/${personUuid}/attribute` : null,
    openmrsFetch,
  );
  const result = useMemo(() => {
    return {
      data: data?.data?.results,
      isLoading: !data && !error,
    };
  }, [data, error]);
  return result;
}

function useClientRegistryIntialValues() {
  const { client, clientExists } = clientRegistryStore.getState();
  const initialValues = {
    patientUuid: v4(),
    givenName: client.firstName,
    middleName: client.middleName,
    familyName: client.lastName,
    unidentifiedPatient: false,
    additionalGivenName: '',
    additionalMiddleName: '',
    additionalFamilyName: '',
    addNameInLocalLanguage: false,
    gender: client.gender === 'male' ? 'Male' : 'Female',
    birthdate: new Date(client?.dateOfBirth),
    yearsEstimated: null,
    monthsEstimated: 0,
    birthdateEstimated: false,
    telephoneNumber: client?.contact?.primaryPhone,
    isDead: !client.isAlive,
    deathDate: '',
    deathCause: '',
    relationships: [],
    identifiers: {
      nationalId: {
        identifierTypeUuid: '49af6cdc-7968-4abb-bf46-de10d7f4859f',
        identifierName: 'National ID',
        identifierValue: client?.identifications !== undefined && client?.identifications[0]?.identificationNumber,
      },
      nationalUniquePatientIdentifier: {
        identifierTypeUuid: 'f85081e2-b4be-4e48-b3a4-7994b69bb101',
        identifierName: 'National Unique patient identifier',
        identifierValue: client?.clientNumber,
      },
    },
    attributes: {
      'b2c38640-2603-4629-aebd-3b54f33f1e3a': client?.contact?.primaryPhone,
      '94614350-84c8-41e0-ac29-86bc107069be': client?.contact?.secondaryPhone,
      'b8d0b331-1d2d-4a9a-b741-1816f498bdb6': client?.contact?.emailAddress ?? '',
    },

    address: {
      address1: client?.residence?.address,
      address2: '',
      address4: client?.residence?.ward,
      cityVillage: client.residence?.village,
      stateProvince: client?.residence?.subCounty,
      countyDistrict: client?.residence?.county,
      country: 'Kenya',
      postalCode: client?.residence?.address,
    },
  };
  return { clientRegistryInitialValues: initialValues, clientExists };
}
