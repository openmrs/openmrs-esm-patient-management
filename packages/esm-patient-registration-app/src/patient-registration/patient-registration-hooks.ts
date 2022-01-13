import { getSynchronizationItems, openmrsFetch, useCurrentPatient } from '@openmrs/esm-framework';
import { Dispatch, useEffect, useState } from 'react';
import { patientRegistration } from '../constants';
import {
  FormValues,
  PatientIdentifierValue,
  PatientRegistration,
  PatientUuidMapType,
} from './patient-registration-types';
import {
  getAddressFieldValuesFromFhirPatient,
  getFormValuesFromFhirPatient,
  getPatientUuidMapFromFhirPatient,
  getPhonePersonAttributeValueFromFhirPatient,
} from './patient-registration-utils';

const blankFormValues: FormValues = {
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
  relationships: [{ relatedPerson: '', relationship: '' }],
  identifiers: [],
};

export function useInitialFormValues(
  patientUuid: string,
  fallback = blankFormValues,
): [FormValues, Dispatch<FormValues>] {
  const [isLoadingPatient, patient] = useCurrentPatient(patientUuid);
  const [isLoadingIdentifiers, identifiers] = usePatientIdentifiers(patientUuid);
  const [initialFormValues, setInitialFormValues] = useState<FormValues>(fallback);

  useEffect(() => {
    (async () => {
      if (patient) {
        setInitialFormValues({
          ...initialFormValues,
          ...getFormValuesFromFhirPatient(patient),
          ...getAddressFieldValuesFromFhirPatient(patient),
          ...getPhonePersonAttributeValueFromFhirPatient(patient),
        });
      } else if (!isLoadingPatient && patientUuid) {
        const registration = await getPatientRegistration(patientUuid);
        setInitialFormValues(registration?.formValues ?? fallback);
      }
    })();
  }, [isLoadingPatient, patient, patientUuid]);

  useEffect(() => {
    if (identifiers) {
      setInitialFormValues((initialFormValues) => ({
        ...initialFormValues,
        identifiers,
      }));
    }
  }, [isLoadingIdentifiers, identifiers]);

  return [initialFormValues, setInitialFormValues];
}

export function useInitialAddressFieldValues(patientUuid: string, fallback = {}): [object, Dispatch<object>] {
  const [isLoadingPatient, patient] = useCurrentPatient(patientUuid);
  const [initialAddressFieldValues, setInitialAddressFieldValues] = useState<object>(fallback);

  useEffect(() => {
    (async () => {
      if (patient) {
        setInitialAddressFieldValues({
          ...initialAddressFieldValues,
          ...getAddressFieldValuesFromFhirPatient(patient),
        });
      } else if (!isLoadingPatient && patientUuid) {
        const registration = await getPatientRegistration(patientUuid);
        setInitialAddressFieldValues(registration?.initialAddressFieldValues ?? fallback);
      }
    })();
  }, [isLoadingPatient, patient, patientUuid]);

  return [initialAddressFieldValues, setInitialAddressFieldValues];
}

export function usePatientUuidMap(
  patientUuid: string,
  fallback = {},
): [PatientUuidMapType, Dispatch<PatientUuidMapType>] {
  const [isLoadingPatient, patient] = useCurrentPatient(patientUuid);
  const [patientUuidMap, setPatientUuidMap] = useState(fallback);

  useEffect(() => {
    (async () => {
      if (patient) {
        setPatientUuidMap({ ...patientUuidMap, ...getPatientUuidMapFromFhirPatient(patient) });
      } else if (!isLoadingPatient && patientUuid) {
        const registration = await getPatientRegistration(patientUuid);
        setPatientUuidMap(registration?.initialAddressFieldValues ?? fallback);
      }
    })();
  }, [isLoadingPatient, patient, patientUuid]);

  return [patientUuidMap, setPatientUuidMap];
}

async function getPatientRegistration(patientUuid: string) {
  const items = await getSynchronizationItems<PatientRegistration>(patientRegistration);
  return items.find((item) => item.patientUuid === patientUuid);
}

function usePatientIdentifiers(patientUuid: string): [boolean, PatientIdentifierValue[] | null] {
  const [patientIdentifiers, setPatientIdentifiers] = useState<PatientIdentifierValue[]>(null);
  useEffect(() => {
    openmrsFetch<{ results: any[] }>(`/ws/rest/v1/patient/${patientUuid}/identifier?v=full`).then((res) => {
      setPatientIdentifiers(
        res.data.results.map((patientIdentifier) => ({
          uuid: patientIdentifier.uuid,
          identifier: patientIdentifier.identifier,
          identifierType: patientIdentifier.identifierType.uuid,
          action: 'NONE',
          source: null,
        })),
      );
    });
  }, [patientUuid]);

  if (!patientUuid) {
    return [false, []];
  }

  return [!!patientIdentifiers, patientIdentifiers];
}
