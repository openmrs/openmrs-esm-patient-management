import { FetchResponse, getSynchronizationItems, openmrsFetch, usePatient } from '@openmrs/esm-framework';
import { Dispatch, useEffect, useMemo, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { v4 } from 'uuid';
import { patientRegistration } from '../constants';
import {
  FormValues,
  PatientRegistration,
  PatientUuidMapType,
  PersonAttributeResponse,
  PatientIdentifierValue,
  PatientIdentifierResponse,
} from './patient-registration-types';
import {
  getAddressFieldValuesFromFhirPatient,
  getFormValuesFromFhirPatient,
  getPatientUuidMapFromFhirPatient,
  getPhonePersonAttributeValueFromFhirPatient,
} from './patient-registration-utils';
import { useInitialPatientRelationships } from './section/patient-relationships/relationships.resource';

export function useInitialFormValues(patientUuid: string): [FormValues, Dispatch<FormValues>] {
  const { isLoading: isLoadingPatientToEdit, patient: patientToEdit } = usePatient(patientUuid);
  const { data: attributes, isLoading: isLoadingAttributes } = useInitialPersonAttributes(patientUuid);
  const { data: identifiers, isLoading: isLoadingIdentifiers } = useInitialPatientIdentifiers(patientUuid);
  const { data: relationships, isLoading: isLoadingRelationships } = useInitialPatientRelationships(patientUuid);
  const [initialFormValues, setInitialFormValues] = useState<FormValues>({
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
    yearsEstimated: 0,
    monthsEstimated: 0,
    birthdateEstimated: false,
    telephoneNumber: '',
    address1: '',
    address2: '',
    cityVillage: '',
    stateProvince: '',
    country: '',
    postalCode: '',
    isDead: false,
    deathDate: '',
    deathCause: '',
    relationships: [],
    identifiers: [],
  });

  useEffect(() => {
    (async () => {
      if (patientToEdit) {
        setInitialFormValues({
          ...initialFormValues,
          ...getFormValuesFromFhirPatient(patientToEdit),
          ...getAddressFieldValuesFromFhirPatient(patientToEdit),
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
      let personAttributes: FormValues['attributes'] = {};
      attributes.forEach((attribute) => {
        personAttributes[attribute.attributeType.uuid] = {
          uuid: attribute.uuid,
          action: 'UPDATE',
          value: attribute.value,
        };
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
          ...getAddressFieldValuesFromFhirPatient(patient),
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
  data: Array<PatientIdentifierValue>;
  isLoading: boolean;
} {
  const shouldFetch = !!patientUuid;

  const { data, error } = useSWRImmutable<FetchResponse<{ results: Array<PatientIdentifierResponse> }>, Error>(
    shouldFetch ? `/ws/rest/v1/patient/${patientUuid}/identifier?v=full` : null,
    openmrsFetch,
  );

  const result: {
    data: Array<PatientIdentifierValue>;
    isLoading: boolean;
  } = useMemo(
    () => ({
      data: data?.data?.results?.map((patientIdentifier) => ({
        uuid: patientIdentifier.uuid,
        identifier: patientIdentifier.identifier,
        identifierTypeUuid: patientIdentifier.identifierType.uuid,
        action: 'NONE',
        source: null,
        preferred: patientIdentifier.identifierType.isPrimary,
      })),
      isLoading: !data && !error,
    }),
    [data, error],
  );

  return result;
}

function useInitialPersonAttributes(personUuid: string) {
  const shouldFetch = !!personUuid;
  const { data, error } = useSWRImmutable<FetchResponse<{ results: Array<PersonAttributeResponse> }>, Error>(
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
