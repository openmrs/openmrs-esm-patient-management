import { openmrsFetch } from '@openmrs/esm-framework';
import { savePatient } from './patient-registration.resource';

jest.mock('@openmrs/esm-framework');

describe('savePatient', () => {
  beforeEach(() => {
    (openmrsFetch as jest.Mock).mockClear();
  });

  it('appends patient uuid in url if provided', () => {
    savePatient(new AbortController(), undefined, '1234');
    expect((openmrsFetch as jest.Mock).mock.calls[0][0]).toEqual('/ws/rest/v1/patient/1234');
  });

  it('does not append patient uuid in url', () => {
    savePatient(new AbortController(), undefined, undefined);
    expect((openmrsFetch as jest.Mock).mock.calls[0][0]).toEqual('/ws/rest/v1/patient/');
  });
});
