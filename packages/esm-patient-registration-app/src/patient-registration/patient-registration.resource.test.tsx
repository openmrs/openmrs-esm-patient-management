import { openmrsFetch } from '@openmrs/esm-framework';
import { savePatient } from './patient-registration.resource';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: jest.fn(),
}));

describe('savePatient', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('appends patient uuid in url if provided', () => {
    mockOpenmrsFetch.mockImplementationOnce((url) => url);
    savePatient(new AbortController(), undefined, '1234');
    expect(mockOpenmrsFetch.mock.calls[0][0]).toEqual('/ws/rest/v1/patient/1234');
  });

  it('does not append patient uuid in url', () => {
    mockOpenmrsFetch.mockImplementationOnce(() => {});
    savePatient(new AbortController(), undefined, undefined);
    expect(mockOpenmrsFetch.mock.calls[0][0]).toEqual('/ws/rest/v1/patient/');
  });
});
