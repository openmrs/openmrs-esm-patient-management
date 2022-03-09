import { getSynchronizationItems, showToast, usePatient } from '@openmrs/esm-framework';
import { Dispatch, useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { patientRegistration } from '../constants';
import { FormValues, PatientRegistration, PatientUuidMapType } from './patient-registration-types';
import {
  getAddressFieldValuesFromFhirPatient,
  getFormValuesFromFhirPatient,
  getInitialPatientAttributes,
  getInitialPatientIdentifiers,
  getPatientUuidMapFromFhirPatient,
  getPhonePersonAttributeValueFromFhirPatient,
} from './patient-registration-utils';
import { getInitialPatientRelationships } from './section/patient-relationships/relationships.resource';

export function useInitialFormValues(patientUuid: string): [FormValues, Dispatch<FormValues>] {
  const { isLoading: isLoadingPatientToEdit, patient: patientToEdit } = usePatient(patientUuid);
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

  useEffect(() => {
    if (patientUuid) {
      getInitialPatientRelationships(patientUuid).then((relationships) =>
        setInitialFormValues((initialFormValues) => ({
          ...initialFormValues,
          relationships,
        })),
      );
      getInitialPatientIdentifiers(patientUuid).then((identifiers) =>
        setInitialFormValues((initialFormValues) => ({
          ...initialFormValues,
          identifiers,
        })),
      );
      getInitialPatientAttributes(patientUuid)
        .then((res) => {
          if (res.ok) {
            let attributes = {};
            res.data.results.forEach((attribute) => {
              attributes[attribute.attributeType.uuid] = attribute.value;
            });
            setInitialFormValues((initialFormValues) => ({
              ...initialFormValues,
              attributes,
            }));
          }
        })
        .catch((err: Error) => {
          showToast({
            title: err.name,
            description: err.message,
            kind: 'error',
          });
        });
    }
  }, [patientUuid]);

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
