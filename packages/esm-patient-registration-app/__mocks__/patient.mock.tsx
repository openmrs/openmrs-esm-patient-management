export const mockPatient = {
  resourceType: 'Patient',
  id: '8673ee4f-e2ab-4077-ba55-4980f408773e',
  extension: [
    {
      url: 'http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created',
      valueDateTime: '2017-01-18T09:42:40+00:00',
    },
    {
      url: 'https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1',
      valueString: 'daemon',
    },
  ],
  identifier: [
    {
      id: '1f0ad7a1-430f-4397-b571-59ea654a52db',
      use: 'secondary',
      system: 'Old Identification Number',
      value: '100732HE',
    },
    {
      id: '1f0ad7a1-430f-4397-b571-59ea654a52db',
      use: 'usual',
      system: 'OpenMRS ID',
      value: '100GEJ',
    },
  ],
  active: true,
  name: [
    {
      id: 'efdb246f-4142-4c12-a27a-9be60b9592e9',
      use: 'usual',
      family: 'Wilson',
      given: ['John'],
    },
  ],
  gender: 'male',
  birthDate: new Date('1972-04-04'),
  deceasedBoolean: false,
  address: [
    {
      id: '0c244eae-85c8-4cc9-b168-96b51f864e77',
      use: 'home',
      line: ['Address10351'],
      city: 'City0351',
      state: 'State0351tested',
      postalCode: '60351',
      country: 'Country0351',
    },
  ],
  telecom: [
    {
      system: 'Mobile',
      value: '25467388299499',
    },
  ],
};
