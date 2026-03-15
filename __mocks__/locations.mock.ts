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
  tags: [{ uuid: 'admission-location-tag-uuid', display: 'Admission Location', name: 'Admission Location' }],
};

export const mockLocations = {
  data: {
    results: [mockLocationMosoriot, mockLocationInpatientWard],
  },
};
