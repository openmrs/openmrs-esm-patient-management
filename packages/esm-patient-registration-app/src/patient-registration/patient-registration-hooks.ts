import { type Dispatch, useEffect, useMemo, useState, useRef } from 'react';
import { camelCase } from 'lodash-es';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { type FetchResponse, type OpenmrsResource, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../config-schema';
import { useInitialPatientRelationships } from './section/patient-relationships/relationships.resource';
import {
  type Encounter,
  type FormValues,
  type PatientIdentifierResponse,
  type PatientUuidMapType,
  type PersonAttributeResponse,
} from './patient-registration.types';
import {
  getAddressFieldValuesFromFhirPatient,
  getFormValuesFromFhirPatient,
  getPatientUuidMapFromFhirPatient,
  getPhonePersonAttributeValueFromFhirPatient,
  latestFirstEncounter,
} from './patient-registration-utils';

interface DeathInfoResults {
  causeOfDeath: OpenmrsResource | null;
  causeOfDeathNonCoded: string | null;
  dead: boolean;
  deathDate: string;
  display: string;
  uuid: string;
}

export function useInitialFormValues(
  patientToEdit: fhir.Patient,
  patientUuid: string,
): [FormValues, Dispatch<FormValues>] {
  const { freeTextFieldConceptUuid } = useConfig<RegistrationConfig>();
  const { data: deathInfo, isLoading: isLoadingDeathInfo } = useInitialPersonDeathInfo(patientUuid);
  const { data: attributes, isLoading: isLoadingAttributes } = useInitialPersonAttributes(patientUuid);
  const { data: identifiers, isLoading: isLoadingIdentifiers } = useInitialPatientIdentifiers(patientUuid);
  const { data: relationships, isLoading: isLoadingRelationships } = useInitialPatientRelationships(patientUuid);
  const { data: encounters } = useInitialEncounters(patientUuid, patientToEdit);

  const [initialFormValues, setInitialFormValues] = useState<FormValues>({
    additionalFamilyName: '',
    additionalGivenName: '',
    additionalMiddleName: '',
    addNameInLocalLanguage: false,
    address: {},
    birthdate: null,
    birthdateEstimated: false,
    deathCause: '',
    deathDate: undefined,
    deathTime: undefined,
    deathTimeFormat: 'AM',
    familyName: '',
    gender: '',
    givenName: '',
    identifiers: {},
    isDead: false,
    middleName: '',
    monthsEstimated: 0,
    nonCodedCauseOfDeath: '',
    patientUuid: v4(),
    relationships: [],
    telephoneNumber: '',
    yearsEstimated: 0,
  });

  useEffect(() => {
    if (patientToEdit) {
      const birthdateEstimated = !/^\d{4}-\d{2}-\d{2}$/.test(patientToEdit.birthDate);
      const estimatedMonthsAvailable = patientToEdit.birthDate.split('-').length > 1;
      const yearsEstimated = birthdateEstimated ? Math.floor(dayjs().diff(patientToEdit.birthDate, 'month') / 12) : 0;
      const monthsEstimated =
        birthdateEstimated && estimatedMonthsAvailable ? dayjs().diff(patientToEdit.birthDate, 'month') % 12 : 0;
      setInitialFormValues((currentValues) => ({
        ...currentValues,
        ...getFormValuesFromFhirPatient(patientToEdit),
        address: getAddressFieldValuesFromFhirPatient(patientToEdit),
        ...getPhonePersonAttributeValueFromFhirPatient(patientToEdit),
        birthdateEstimated: !/^\d{4}-\d{2}-\d{2}$/.test(patientToEdit.birthDate),
        yearsEstimated,
        monthsEstimated,
      }));
    }
  }, [patientToEdit]);

  // Set initial patient death info
  useEffect(() => {
    if (!isLoadingDeathInfo && deathInfo?.dead) {
      const deathDatetime = deathInfo.deathDate || null;
      const deathDate = deathDatetime ? new Date(deathDatetime) : undefined;
      const time = deathDate ? dayjs(deathDate).format('hh:mm') : undefined;
      const timeFormat = deathDate ? (dayjs(deathDate).hour() >= 12 ? 'PM' : 'AM') : 'AM';
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        isDead: deathInfo.dead || false,
        deathDate: deathDate,
        deathTime: time,
        deathTimeFormat: timeFormat,
        deathCause: deathInfo.causeOfDeathNonCoded ? freeTextFieldConceptUuid : deathInfo.causeOfDeath?.uuid,
        nonCodedCauseOfDeath: deathInfo.causeOfDeathNonCoded,
      }));
    }
  }, [isLoadingDeathInfo, deathInfo, freeTextFieldConceptUuid]);

  // Combined effect for relationships and identifiers
  useEffect(() => {
    if (!isLoadingRelationships && relationships) {
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        relationships,
      }));
    }

    if (!isLoadingIdentifiers && identifiers) {
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        identifiers,
      }));
    }
  }, [isLoadingRelationships, relationships, isLoadingIdentifiers, identifiers]);

  // Set Initial person attributes
  useEffect(() => {
    if (!isLoadingAttributes && attributes) {
      const personAttributes = attributes.reduce(
        (acc, attribute) => ({
          ...acc,
          [attribute.attributeType.uuid]:
            attribute.attributeType.format === 'org.openmrs.Concept' && typeof attribute.value === 'object'
              ? attribute.value?.uuid
              : attribute.value,
        }),
        {},
      );
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        attributes: personAttributes,
      }));
    }
  }, [attributes, isLoadingAttributes]);

  // Set Initial registration encounters
  useEffect(() => {
    if (patientToEdit && encounters) {
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        obs: encounters as Record<string, string>,
      }));
    }
  }, [encounters, patientToEdit]);

  return [initialFormValues, setInitialFormValues];
}

export function usePatientUuidMap(
  fallback: PatientUuidMapType = {},
  patientToEdit: fhir.Patient,
  patientUuid: string,
): [PatientUuidMapType, Dispatch<PatientUuidMapType>] {
  const fallbackRef = useRef(fallback);
  const [patientUuidMap, setPatientUuidMap] = useState(fallbackRef.current);
  const { data: attributes } = useInitialPersonAttributes(patientUuid);

  useEffect(() => {
    if (patientToEdit) {
      setPatientUuidMap((prevMap) => ({
        ...prevMap,
        ...getPatientUuidMapFromFhirPatient(patientToEdit),
      }));
    }
  }, [patientToEdit]);

  useEffect(() => {
    if (attributes) {
      setPatientUuidMap((prevMap) => ({
        ...prevMap,
        ...getPatientAttributeUuidMapForPatient(attributes),
      }));
    }
  }, [attributes]);

  return [patientUuidMap, setPatientUuidMap];
}

export function useInitialPatientIdentifiers(patientUuid: string): {
  data: FormValues['identifiers'];
  isLoading: boolean;
} {
  const shouldFetch = !!patientUuid;

  const { data, isLoading } = useSWR<FetchResponse<{ results: Array<PatientIdentifierResponse> }>, Error>(
    shouldFetch
      ? `${restBaseUrl}/patient/${patientUuid}/identifier?v=custom:(uuid,identifier,identifierType:(uuid,required,name),preferred)`
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
      isLoading,
    };
  }, [data?.data?.results, isLoading]);

  return result;
}

function useInitialEncounters(patientUuid: string, patientToEdit: fhir.Patient) {
  const { registrationObs } = useConfig<RegistrationConfig>();
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<Encounter> }>>(
    patientToEdit && registrationObs.encounterTypeUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&v=custom:(encounterDatetime,obs:(concept:ref,value:ref))&encounterType=${registrationObs.encounterTypeUuid}`
      : null,
    openmrsFetch,
  );
  const obs = data?.data.results.sort(latestFirstEncounter)?.at(0)?.obs;
  const encounters = obs
    ?.map(({ concept, value }) => ({
      [(concept as OpenmrsResource).uuid]: typeof value === 'object' ? value?.uuid : value,
    }))
    .reduce((accu, curr) => Object.assign(accu, curr), {});

  return { data: encounters, isLoading, error };
}

function useInitialPersonAttributes(personUuid: string) {
  const shouldFetch = !!personUuid;
  const { data, isLoading } = useSWR<FetchResponse<{ results: Array<PersonAttributeResponse> }>, Error>(
    shouldFetch
      ? `${restBaseUrl}/person/${personUuid}/attribute?v=custom:(uuid,display,attributeType:(uuid,display,format),value)`
      : null,
    openmrsFetch,
  );
  const result = useMemo(() => {
    return {
      data: data?.data?.results,
      isLoading,
    };
  }, [data?.data?.results, isLoading]);
  return result;
}

function useInitialPersonDeathInfo(personUuid: string) {
  const { data, isLoading } = useSWR<FetchResponse<DeathInfoResults>, Error>(
    !!personUuid
      ? `${restBaseUrl}/person/${personUuid}?v=custom:(uuid,display,causeOfDeath,dead,deathDate,causeOfDeathNonCoded)`
      : null,
    openmrsFetch,
  );

  const result = useMemo(() => {
    return {
      data: data?.data,
      isLoading,
    };
  }, [data?.data, isLoading]);
  return result;
}

function getPatientAttributeUuidMapForPatient(attributes: Array<PersonAttributeResponse>) {
  const attributeUuidMap = {};
  attributes.forEach((attribute) => {
    attributeUuidMap[`attribute.${attribute?.attributeType?.uuid}`] = attribute?.uuid;
  });
  return attributeUuidMap;
}
