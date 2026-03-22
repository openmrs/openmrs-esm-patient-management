import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { savePatient } from './patient-registration.resource';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

describe('savePatient', () => {
  it('appends patient uuid in url if provided', () => {
    mockOpenmrsFetch.mockImplementationOnce(() => Promise.resolve({} as any));
    savePatient(null, '1234');
    expect(mockOpenmrsFetch.mock.calls[0][0]).toEqual(`${restBaseUrl}/patient/1234`);
  });

  it('does not append patient uuid in url', () => {
    mockOpenmrsFetch.mockImplementationOnce(() => Promise.resolve({} as any));
    savePatient(null);
    expect(mockOpenmrsFetch.mock.calls[0][0]).toEqual(`${restBaseUrl}/patient/`);
  });
});
