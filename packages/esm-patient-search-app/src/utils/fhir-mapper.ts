import { v4 as uuidv4 } from 'uuid';
import type { OpenmrsResource } from '@openmrs/esm-framework';
import type { SearchedPatient, Address, Identifier } from '../types';

const getGender = (gender: string) => {
  switch (gender) {
    case 'M':
      return 'male';
    case 'F':
      return 'female';
    case 'O':
      return 'other';
    case 'U':
      return 'unknown';
    default:
      return gender;
  }
};

export function mapToFhirPatient(patient: SearchedPatient) {
  const preferredAddress = patient.person.addresses?.find((address) => address.preferred);
  const addressId = uuidv4();
  const nameId = uuidv4();

  return {
    resourceType: 'Patient',
    address: preferredAddress
      ? [
          {
            id: addressId,
            city: preferredAddress.cityVillage,
            country: preferredAddress.country,
            postalCode: preferredAddress.postalCode,
            state: preferredAddress.stateProvince,
            use: 'home',
          },
        ]
      : [],
    birthDate: patient.person.birthdate,
    deceasedBoolean: patient.person.dead,
    deceasedDateTime: patient.person.deathDate ?? undefined,
    gender: getGender(patient.person.gender),
    id: patient.uuid,
    identifier: patient.identifiers.map((identifier) => ({
      id: identifier.uuid,
      type: {
        coding: [
          {
            code: identifier.identifierType.uuid,
          },
        ],
        text: identifier.identifierType.display,
      },
      use: 'official',
      value: identifier.identifier,
    })),
    name: [
      {
        id: nameId,
        given: [patient.person.personName.givenName, patient.person.personName.middleName],
        family: patient.person.personName.familyName,
        text: patient.person.personName.display,
      },
    ],
    telecom:
      patient.attributes
        ?.filter((attribute) => attribute.attributeType.display === 'Telephone Number')
        ?.map((phone) => ({
          system: 'phone',
          value: phone.value.toString(),
          use: 'mobile',
        })) ?? [],
  };
}

function calculateAgeFromBirthDate(birthDate?: string): number {
  if (!birthDate) {
    return 0;
  }

  try {
    const dob = new Date(birthDate);

    if (isNaN(dob.getTime())) {
      return 0;
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return Math.max(0, age);
  } catch (error) {
    return 0;
  }
}

/**
 * Maps a FHIR Patient resource to the OpenMRS SearchedPatient format
 * @param patient - FHIR Patient resource
 * @param contactAttributeType - Array of contact attribute type UUIDs from config [telephoneUuid, emailUuid]
 * @returns SearchedPatient object
 */
export function mapSearchedPatientFromFhir(patient: fhir.Patient, contactAttributeType?: string[]): SearchedPatient {
  const name = (patient.name && patient.name[0]) || ({} as fhir.HumanName);
  const address = (patient.address && patient.address[0]) || ({} as fhir.Address);

  const personNameDisplay = name?.text || [...(name?.given || []), name?.family].filter(Boolean).join(' ');

  const mappedAddress: Address = {
    preferred: true,
    voided: false,
    address1: address?.text || [address?.line?.[0], address?.line?.[1]].filter(Boolean).join(' '),
    cityVillage: address?.city || '',
    country: address?.country || '',
    postalCode: address?.postalCode || '',
    stateProvince: address?.state || '',
  };

  const mappedIdentifiers: Array<Identifier> = (patient.identifier || []).map((id) => ({
    display: id.value || '',
    identifier: id.value || '',
    identifierType: {
      uuid: (id.type?.coding && id.type.coding[0]?.code) || '',
      display: id.type?.text || id.type?.coding?.[0]?.display || '',
    } as OpenmrsResource,
    location: {
      uuid: '',
      display: '',
    } as OpenmrsResource,
    uuid: id.id || uuidv4(),
    preferred: id.use === 'official',
  }));

  const telephoneAttributeTypeUuid = contactAttributeType?.[0];

  const phoneAttributes = (patient.telecom || [])
    .filter((t) => t.system === 'phone' && t.value)
    .map((phone) => ({
      attributeType: {
        uuid: telephoneAttributeTypeUuid || '',
        display: 'Telephone Number',
      },
      value: phone.value || '',
      uuid: uuidv4(),
    }));

  return {
    uuid: patient.id || '',
    identifiers: mappedIdentifiers,
    person: {
      addresses: [mappedAddress],
      age: calculateAgeFromBirthDate(patient.birthDate),
      birthdate: patient.birthDate || '',
      gender: (patient.gender as string) || 'unknown',
      dead: Boolean(patient.deceasedBoolean || patient.deceasedDateTime),
      deathDate: (patient.deceasedDateTime as string) || null,
      personName: {
        display: personNameDisplay || '',
        givenName: (name?.given && (name.given[0] as string)) || '',
        familyName: (name?.family as string) || '',
        middleName: (name?.given && (name.given[1] as string)) || '',
      },
    },
    attributes: phoneAttributes,
  };
}
