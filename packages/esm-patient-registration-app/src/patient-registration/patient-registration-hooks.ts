import { getSynchronizationItems, openmrsFetch, useCurrentPatient } from '@openmrs/esm-framework';
import { Dispatch, useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { patientRegistration } from '../constants';
import { FormValues, PatientRegistration, PatientUuidMapType } from './patient-registration-types';
import {
  getAddressFieldValuesFromFhirPatient,
  getFormValuesFromFhirPatient,
  getPatientIdentifiers,
  getPatientUuidMapFromFhirPatient,
  getPhonePersonAttributeValueFromFhirPatient,
} from './patient-registration-utils';

export function useInitialFormValues(patientUuid: string): [FormValues, Dispatch<FormValues>] {
  const [isLoadingPatientToEdit, patientToEdit] = useCurrentPatient(patientUuid);
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
    relationships: [{ relatedPerson: '', relationship: '' }],
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
          identifiers: await getPatientIdentifiers(patientUuid),
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
        setInitialAddressFieldValues(registration?._patientRegistrationData.initialAddressFieldValues ?? fallback);
      }
    })();
  }, [isLoadingPatient, patient, patientUuid]);

  return [initialAddressFieldValues, setInitialAddressFieldValues];
}

export function usePatientUuidMap(
  patientUuid: string,
  fallback: PatientUuidMapType = {},
): [PatientUuidMapType, Dispatch<PatientUuidMapType>] {
  const [isLoadingPatient, patient] = useCurrentPatient(patientUuid);
  const [patientUuidMap, setPatientUuidMap] = useState(fallback);

  useEffect(() => {
    if (patient) {
      setPatientUuidMap({ ...patientUuidMap, ...getPatientUuidMapFromFhirPatient(patient) });
    } else if (!isLoadingPatient && patientUuid) {
      getPatientRegistration(patientUuid).then((registration) =>
        setPatientUuidMap(registration?._patientRegistrationData.initialAddressFieldValues ?? fallback),
      );
    }
  }, [isLoadingPatient, patient, patientUuid]);

  return [patientUuidMap, setPatientUuidMap];
}

async function getPatientRegistration(patientUuid: string) {
  const items = await getSynchronizationItems<PatientRegistration>(patientRegistration);
  return items.find((item) => item._patientRegistrationData.formValues.patientUuid === patientUuid);
}
