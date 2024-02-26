import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
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
    savePatient(null, '1234');
    expect(mockOpenmrsFetch.mock.calls[0][0]).toEqual(`${restBaseUrl}/patient/1234`);
  });

  it('does not append patient uuid in url', () => {
    mockOpenmrsFetch.mockImplementationOnce(() => {});
    savePatient(null);
    expect(mockOpenmrsFetch.mock.calls[0][0]).toEqual(`${restBaseUrl}/patient/`);
  });
});
