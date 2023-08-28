import { FHIRResource, showModal } from '@openmrs/esm-framework';
import { FormikProps } from 'formik';
import { ClientRegistryPatient, RegistryPatient } from './verification-types';
import counties from './assets/counties.json';
import { FormValues } from '../patient-registration/patient-registration.types';

export function handleClientRegistryResponse(clientResponse: any, props: FormikProps<FormValues>, searchTerm: string) {
  if (clientResponse?.total > 0) {
    const patientObject = clientResponse.entry[0].resource as fhir.Patient;
    const dispose = showModal('confirm-client-registry-modal', {
      onConfirm: () => {
        props.setValues({
          ...props.values,
          familyName: patientObject.name[0].family,
          middleName: patientObject.name[0].given[1],
          givenName: patientObject.name[0].given[0],
          gender: patientObject.gender === 'male' ? 'Male' : 'Female',
          birthdate: new Date(patientObject.birthDate).toLocaleDateString(),
          isDead: !patientObject.deceasedBoolean,
          attributes: {},
          address: {
            address1: patientObject.address[0].city,
            country: patientObject.address[0].country,
          },
          identifiers: { ...props.values.identifiers },
          obs: {},
        });
        dispose();
      },
      close: () => dispose(),
      patient: patientObject,
    });
  }
}

export function generateNUPIPayload(formValues: FormValues): RegistryPatient {
  const educationLevel = formValues.concepts.find(
    (concept) => concept.uuid === formValues.obs['1712AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
  );
  const occupation = formValues.concepts.find(
    (concept) => concept.uuid === formValues.obs['1542AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
  );
  const maritalStatus = formValues.concepts.find(
    (concept) => concept.uuid === formValues.obs['1054AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
  );

  let createRegistryPatient: RegistryPatient = {
    firstName: formValues?.givenName,
    middleName: formValues?.middleName,
    lastName: formValues?.familyName,
    gender: formValues?.gender === 'Male' ? 'male' : 'female',
    dateOfBirth: new Date(formValues.birthdate).toISOString(),
    isAlive: !formValues.isDead,
    residence: {
      county: `0${counties.find((county) => county.name.includes(formValues.address['countyDistrict']))?.code}`,
      subCounty: formValues.address['stateProvince']?.toLocaleLowerCase(),
      ward: formValues.address['address4']?.toLocaleLowerCase(),
      village: formValues.address['cityVillage'],
      landmark: formValues.address['address2'],
      address: formValues.address['postalCode'],
    },
    nextOfKins: [],
    contact: {
      primaryPhone: formValues.attributes['b2c38640-2603-4629-aebd-3b54f33f1e3a'],
      secondaryPhone: formValues.attributes['94614350-84c8-41e0-ac29-86bc107069be'],
      emailAddress: formValues.attributes['b8d0b331-1d2d-4a9a-b741-1816f498bdb6'],
    },
    country: 'KE',
    countyOfBirth: `0${counties.find((county) => county.name.includes(formValues.address['countyDistrict']))?.code}`,
    educationLevel: educationLevel?.display?.toLowerCase() ?? '',
    religion: '',
    occupation: occupation?.display?.toLowerCase() ?? '',
    maritalStatus: maritalStatus?.display?.toLowerCase() ?? '',
    originFacilityKmflCode: '',
    nascopCCCNumber: '',
    identifications: [
      {
        identificationType: 'national-id',
        identificationNumber: formValues.identifiers['nationalId']?.identifierValue,
      },
    ],
  };
  return createRegistryPatient;
}
