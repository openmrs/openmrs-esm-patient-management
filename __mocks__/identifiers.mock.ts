export const openmrsID = {
  name: 'OpenMRS ID',
  fieldName: 'OpenMRS ID',
  required: true,
  uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
  format: null,
  isPrimary: true,
  identifierSources: [
    {
      uuid: '691eed12-c0f1-11e2-94be-8c13b969e334',
      name: 'Generator 1 for OpenMRS ID',
      autoGenerationOption: {
        manualEntryEnabled: false,
        automaticGenerationEnabled: true,
      },
    },
    {
      uuid: '01af8526-cea4-4175-aa90-340acb411771',
      name: 'Generator 2 for OpenMRS ID',
      autoGenerationOption: {
        manualEntryEnabled: true,
        automaticGenerationEnabled: true,
      },
    },
  ],
  autoGenerationSource: null,
  uniquenessBehavior: 'UNIQUE' as const,
};
