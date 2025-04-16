import { v4 as uuidv4 } from 'uuid';
import type { SearchedPatient } from '../types';

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
