import { FetchResponse, getSynchronizationItems, openmrsFetch, usePatient } from '@openmrs/esm-framework';
import camelCase from 'lodash-es/camelCase';
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { v4 } from 'uuid';
import { RegistrationConfig } from '../config-schema';
import { patientRegistration } from '../constants';
import { useMPIPatient } from './mpi/useMPIPatient';
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

export function useInitialFormValues(
  patientUuid: string,
  isMPIRecordId: boolean = false,
  config: RegistrationConfig,
): [FormValues, Dispatch<FormValues>, boolean] {
  const { isLoading: isLoadingPatientToEdit, patient: patientToEdit } = usePatient(isMPIRecordId ? null : patientUuid);
  const getEmrsRecordId = useCallback(() => (!isMPIRecordId ? patientUuid : null), [isMPIRecordId, patientUuid]);
  const { isLoading: isLoadingSourcePatientObject, patient: sourcePatientObject } = useMPIPatient(
    isMPIRecordId ? patientUuid : null,
    config?.MPI?.baseAPIPath,
  );
  const { data: attributes, isLoading: isLoadingAttributes } = useInitialPersonAttributes(getEmrsRecordId());
  const { data: identifiers, isLoading: isLoadingIdentifiers } = useInitialPatientIdentifiers(getEmrsRecordId());
  const { data: relationships, isLoading: isLoadingRelationships } = useInitialPatientRelationships(getEmrsRecordId());
  const [isLoadingBaseInitialValues, setIsLoadingBaseInitialValues] = useState(true);
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
  });

  useEffect(() => {
    (async () => {
      if (patientToEdit) {
        setInitialFormValues({
          ...initialFormValues,
          ...getFormValuesFromFhirPatient(patientToEdit),
          address: getAddressFieldValuesFromFhirPatient(patientToEdit),
          ...getPhonePersonAttributeValueFromFhirPatient(patientToEdit),
        });
        setIsLoadingBaseInitialValues(false);
      } else if (!isLoadingPatientToEdit && patientUuid) {
        const registration = await getPatientRegistration(patientUuid);

        if (!registration?._patientRegistrationData?.formValues) {
          console.error(
            `Found a queued offline patient registration for patient ${patientUuid}, but without form values. Not using these values.`,
          );
          return;
        }
        setInitialFormValues(registration._patientRegistrationData.formValues);
        setIsLoadingBaseInitialValues(false);
      }
    })();
  }, [isLoadingPatientToEdit, patientToEdit, patientUuid]);

  useEffect(() => {
    const { MPI: mpiConfig } = config;
    if (sourcePatientObject) {
      const values = {
        ...initialFormValues,
        ...getFormValuesFromFhirPatient(sourcePatientObject),
        address: getAddressFieldValuesFromFhirPatient(sourcePatientObject),
        ...getPhonePersonAttributeValueFromFhirPatient(sourcePatientObject),
      };

      // retrieve external Health identifier
      values.identifiers = sourcePatientObject.identifier
        .filter((id) => id.type.coding[0]?.code == mpiConfig.preferredPatientIdentifierType)
        .map((id) => ({
          identifierTypeUuid: mpiConfig.preferredPatientIdentifierType,
          initialValue: id.value,
          identifierValue: id.value,
          identifierName: mpiConfig.preferredPatientIdentifierTitle,
          selectedSource: null,
          preferred: false,
          required: false,
        }))
        .map((id) => ({ [camelCase(id.identifierName)]: id }))[0];
      setInitialFormValues(values);
      setIsLoadingBaseInitialValues(false);
    }
  }, [sourcePatientObject, isLoadingSourcePatientObject]);

  // Set initial patient relationships
  useEffect(() => {
    if (!isLoadingRelationships && relationships?.length) {
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        relationships,
      }));
    }
  }, [isLoadingRelationships, relationships, setInitialFormValues]);

  // Set Initial patient identifiers
  useEffect(() => {
    if (!isLoadingIdentifiers && identifiers && Object.keys(identifiers).length) {
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        identifiers,
      }));
    }
  }, [isLoadingIdentifiers, identifiers, setInitialFormValues]);

  // Set Initial person attributes
  useEffect(() => {
    if (!isLoadingAttributes && attributes?.length) {
      let personAttributes = {};
      attributes.forEach((attribute) => {
        personAttributes[attribute.attributeType.uuid] = attribute.value;
      });
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        attributes: personAttributes,
      }));
    }
  }, [attributes, setInitialFormValues, isLoadingAttributes]);

  return [initialFormValues, setInitialFormValues, isLoadingBaseInitialValues];
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
      isLoading: !data && !error && shouldFetch,
    };
  }, [data, error, shouldFetch]);
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
      isLoading: !data && !error && shouldFetch,
    };
  }, [data, error, shouldFetch]);
  return result;
}
