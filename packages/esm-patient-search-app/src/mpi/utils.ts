import capitalize from 'lodash-es/capitalize';

export function inferModeFromSearchParams(searchParams: URLSearchParams) {
  return searchParams?.get('mode')?.toLowerCase() == 'external' ? 'external' : 'internal';
}

export function mapToOpenMRSPatient(fhirPatients: any): any {
  if (fhirPatients.total < 1) {
    return null;
  }
  const pts = [];

  fhirPatients[0].entry.forEach((pt, index) => {
    let fhirPatient = pt.resource;
    pts.push({
      externalId: fhirPatient.id,
      uuid: null,
      identifiers: {},
      person: {
        addresses: fhirPatient?.address?.map((address) => ({
          cityVillage: address.city,
          stateProvince: address.state,
          country: address.country,
          postalCode: address.postalCode,
          preferred: false,
          address1: '',
        })),
        age: null,
        birthdate: fhirPatient.birthDate,
        gender: capitalize(fhirPatient.gender),
        death: !fhirPatient.active,
        deathDate: '',
        personName: {
          display: `${fhirPatient.name[0].family} ${fhirPatient.name[0].given[0]}`,
          givenName: fhirPatient.name[0].given[0],
          familyName: fhirPatient.name[0].family,
          middleName: fhirPatient.name[0].given[1],
        },
      },
      attributes: [],
    });
  });

  return pts;
}
