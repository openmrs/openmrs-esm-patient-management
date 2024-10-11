import { type FHIRIdentifier, type FHIRPatientType, type SearchedPatient } from '../types';

export function toFhirPatient(patient: SearchedPatient): FHIRPatientType {
  const preferredAddress = patient.person.addresses?.find((address) => address.preferred);
  return {
    id: patient.uuid,
    name: [
      {
        id: String(Math.random()), // not used
        given: [patient.person.personName.givenName, patient.person.personName.middleName],
        family: patient.person.personName.familyName,
        text: patient.person.personName.display,
      },
    ],
    gender: patient.person.gender,
    birthDate: patient.person.birthdate,
    deceasedDateTime: patient.person.deathDate,
    deceasedBoolean: patient.person.dead,
    identifier: patient.identifiers as unknown as Array<FHIRIdentifier>,
    address: preferredAddress
      ? [
          {
            id: String(Math.random()), // not used
            city: preferredAddress.cityVillage,
            country: preferredAddress.country,
            postalCode: preferredAddress.postalCode,
            state: preferredAddress.stateProvince,
            use: 'home',
          },
        ]
      : [],
    telecom: patient.attributes?.filter((attribute) => attribute.attributeType.display == 'Telephone Number'),
  };
}
