import { type Location } from '@openmrs/esm-framework';

export const mockLocationMosoriot: Location = {
  uuid: 'some-uuid1',
  name: 'Mosoriot',
  display: 'Mosoriot',
};

export const mockLocationInpatientWard: Location = {
  uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
  display: 'Inpatient Ward',
  name: 'Inpatient Ward',
  tags: [
    {
      uuid: '1c783dca-fd54-4ea8-a0fc-2875374e9cb6',
      display: 'Admission Location',
    },
    {
      uuid: '8d4626ca-7abd-42ad-be48-56767bbcf272',
      display: 'Transfer Location',
    },
  ],
};

export const mockLocations = {
  data: {
    results: [mockLocationMosoriot, mockLocationInpatientWard],
  },
};
