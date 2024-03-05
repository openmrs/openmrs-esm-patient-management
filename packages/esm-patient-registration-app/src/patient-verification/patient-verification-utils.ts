import { showModal } from '@openmrs/esm-framework';
import { type FormikProps } from 'formik';
import { type ClientRegistryPatient, type RegistryPatient } from './verification-types';
import counties from './assets/counties.json';
import { type FormValues } from '../patient-registration/patient-registration.types';
import { capitalize } from 'lodash-es';

export function handleClientRegistryResponse(
  clientResponse: ClientRegistryPatient,
  props: FormikProps<FormValues>,
  searchTerm: string,
) {
  if (clientResponse?.clientExists === false) {
    const nupiIdentifiers = {
      ['nationalId']: {
        initialValue: searchTerm,
        identifierUuid: undefined,
        selectedSource: { uuid: '', name: '' },
        preferred: false,
        required: false,
        identifierTypeUuid: '49af6cdc-7968-4abb-bf46-de10d7f4859f',
        identifierName: 'National ID',
        identifierValue: searchTerm,
      },
    };
    const dispose = showModal('empty-client-registry-modal', {
      onConfirm: () => {
        props.setValues({ ...props.values, identifiers: { ...props.values.identifiers, ...nupiIdentifiers } });
        dispose();
      },
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
        educationLevel,
        occupation,
        maritalStatus,
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
          gender: clientResponse.client.gender,
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
            address4: capitalize(residence?.ward ?? ''),
            cityVillage: residence?.village,
            stateProvince: capitalize(residence?.subCounty ?? ''),
            countyDistrict: counties.find((county) => county.code === parseInt(residence?.county))?.name,
            country: 'Kenya',
            postalCode: residence?.address,
          },
          identifiers: { ...props.values.identifiers, ...nupiIdentifiers },
          obs: {
            '1054AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
              props.values.concepts.find(
                (concept) =>
                  concept.display?.toLowerCase()?.includes(clientResponse.client.maritalStatus?.toLowerCase()),
              )?.uuid ?? '',
            '1712AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
              props.values.concepts.find(
                (concept) =>
                  concept.display?.toLowerCase()?.includes(clientResponse.client.educationLevel?.toLowerCase()),
              )?.uuid ?? '',
            '1542AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
              clientResponse.client.occupation === undefined || clientResponse.client.occupation === null
                ? '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                : props.values.concepts.find(
                    (concept) => concept.display?.toLowerCase() === clientResponse.client.occupation?.toLowerCase(),
                  )?.uuid ?? '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
        });
        dispose();
      },
      close: () => dispose(),
      patient: clientResponse.client,
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
