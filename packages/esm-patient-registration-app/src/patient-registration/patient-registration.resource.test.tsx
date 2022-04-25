import { openmrsFetch } from '@openmrs/esm-framework';
import { savePatient } from './patient-registration.resource';

const mockOpenMRSFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: jest.fn(),
}));

describe('savePatient', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('appends patient uuid in url if provided', () => {
    mockOpenMRSFetch.mockImplementationOnce((url) => url);
    savePatient(new AbortController(), undefined, '1234');
    expect((openmrsFetch as jest.Mock).mock.calls[0][0]).toEqual('/ws/rest/v1/patient/1234');
  });

  it('does not append patient uuid in url', () => {
    mockOpenMRSFetch.mockImplementationOnce(() => {});
    savePatient(new AbortController(), undefined, undefined);
    expect((openmrsFetch as jest.Mock).mock.calls[0][0]).toEqual('/ws/rest/v1/patient/');
  });
});
