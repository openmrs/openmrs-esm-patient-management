import { showModal } from '@openmrs/esm-framework';
import { type FormikProps } from 'formik';
import { type ClientRegistryFhirPatientResponse } from './verification-types';
import { type FormValues } from '../patient-registration/patient-registration.types';
import capitalize from 'lodash-es/capitalize';

function createIdentifierPayload(identifier: any, identifierName: string) {
  return {
    initialValue: identifier.value,
    identifierUuid: undefined,
    selectedSource: { uuid: '', name: '' },
    preferred: false,
    required: false,
    identifierTypeUuid: identifier.type?.coding?.[0]?.code || identifier.system,
    identifierName: identifierName,
    identifierValue: identifier.value,
  };
}

function mapIdentifiersToPayload(identifiers: any[]) {
  const identifierMap: Record<string, any> = {};

  identifiers?.forEach((identifier) => {
    if (identifier.type?.coding?.[0]?.code) {
      // Use the type code as the key
      const key = identifier.type.coding[0].code.toLowerCase();
      identifierMap[key] = createIdentifierPayload(identifier, identifier.type.text || 'Unknown Type');
    } else if (identifier.system) {
      // Use system-based mapping for identifiers without type.coding
      let key: string;
      let name: string;

      switch (identifier.system) {
        case 'UPI':
          key = 'upid';
          name = 'UPID';
          break;
        case 'http://clientregistry.org/openmrs':
          key = 'openmrs';
          name = 'OpenMRS ID';
          break;
        default:
          key = identifier.system.toLowerCase();
          name = identifier.system;
      }

      identifierMap[key] = createIdentifierPayload(identifier, name);
    }
  });

  return identifierMap;
}

export function handleClientRegistryResponse(
  clientResponse: ClientRegistryFhirPatientResponse,
  props: FormikProps<FormValues>,
  searchTerm: string,
) {
  if (clientResponse?.total === 0) {
    const dispose = showModal('empty-client-registry-modal', {
      onConfirm: () => {
        props.setValues({ ...props.values, identifiers: { ...props.values.identifiers } });
        dispose();
      },
      close: () => dispose(),
    });
  }

  if (clientResponse?.total > 0) {
    let crPatient = clientResponse?.entry[0].resource;
    let residentialAddress = crPatient.address[0];

    const patientIdentifiers = mapIdentifiersToPayload(crPatient.identifier);

    const dispose = showModal('confirm-client-registry-modal', {
      onConfirm: () => {
        props.setValues({
          ...props.values,
          familyName: crPatient.name[0]?.family,
          middleName: '',
          givenName: crPatient.name[0]?.given?.join(' '),
          gender: crPatient.gender?.toLowerCase(),
          birthdate: new Date(crPatient.birthDate),
          isDead: false,
          address: {
            address1: residentialAddress?.text,
            cityVillage: residentialAddress?.city,
            stateProvince: capitalize(residentialAddress?.state ?? ''),
            countyDistrict: residentialAddress?.district,
            country: residentialAddress?.country,
            postalCode: residentialAddress?.postalCode,
          },
          identifiers: { ...props.values.identifiers, ...patientIdentifiers },
        });
        dispose();
      },
      close: () => dispose(),
      patient: crPatient,
    });
  }
}
