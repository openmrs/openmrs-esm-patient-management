import { showModal } from '@openmrs/esm-framework';
import { FormikProps } from 'formik';
import { FormValues } from '../patient-registration/patient-registration-types';
import { ClientRegistryPatient, RegistryPatient } from './verification-types';
import counties from './assets/counties.json';

export function handleClientRegistryResponse(clientResponse: ClientRegistryPatient, props: FormikProps<FormValues>) {
  if (clientResponse?.clientExists === false) {
    const dispose = showModal('empty-client-registry-modal', {
      onConfirm: () => dispose(),
      close: () => dispose(),
    });
  }

  if (clientResponse?.clientExists) {
    const {
      client: {
        middleName,
        lastName,
        firstName,
        contact,
        country,
        countyOfBirth,
        residence,
        identifications,
        gender,
        dateOfBirth,
        isAlive,
        clientNumber,
      },
    } = clientResponse;

    const nupiIdentifiers = {
      ['nationalId']: {
        initialValue: identifications !== undefined && identifications[0]?.identificationNumber,
        identifierUuid: undefined,
        selectedSource: { uuid: '', name: '' },
        preferred: false,
        required: false,
        identifierTypeUuid: '49af6cdc-7968-4abb-bf46-de10d7f4859f',
        identifierName: 'National ID',
        identifierValue: identifications !== undefined && identifications[0]?.identificationNumber,
      },

      ['nationalUniquePatientIdentifier']: {
        identifierTypeUuid: 'f85081e2-b4be-4e48-b3a4-7994b69bb101',
        identifierName: 'National Unique patient identifier',
        identifierValue: clientNumber,
        initialValue: clientNumber,
        identifierUuid: undefined,
        selectedSource: { uuid: '', name: '' },
        preferred: false,
        required: false,
      },
    };

    const dispose = showModal('confirm-client-registry-modal', {
      onConfirm: () => {
        props.setValues({
          ...props.values,
          familyName: lastName,
          middleName: middleName,
          givenName: firstName,
          gender: gender === 'male' ? 'Male' : 'Female',
          birthdate: new Date(dateOfBirth),
          isDead: !isAlive,
          attributes: {
            'b2c38640-2603-4629-aebd-3b54f33f1e3a': contact?.primaryPhone,
            '94614350-84c8-41e0-ac29-86bc107069be': contact?.secondaryPhone,
            'b8d0b331-1d2d-4a9a-b741-1816f498bdb6': contact?.emailAddress ?? '',
          },
          address: {
            address1: residence?.address,
            address2: '',
            address4: residence?.ward,
            cityVillage: residence?.village,
            stateProvince: residence?.subCounty,
            countyDistrict: counties.find((county) => county.code === parseInt(residence?.county))?.name,
            country: 'Kenya',
            postalCode: residence?.address,
          },
          identifiers: { ...props.values.identifiers, ...nupiIdentifiers },
        });
        dispose();
      },
      close: () => dispose(),
      patient: clientResponse.client,
    });
  }
}

export function generateNUPIPayload(formValues: FormValues): RegistryPatient {
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
    countyOfBirth: '036',
    educationLevel: '',
    religion: '',
    occupation: '',
    maritalStatus: '',
    originFacilityKmflCode: '15205',
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
