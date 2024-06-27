import userEvent from '@testing-library/user-event';
import { renderWithSwr } from '../../../../tools/test-utils';
import { screen } from '@testing-library/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import AdmissionRequestsBar from './admission-requests-bar.component';
import { mockInpatientRequest } from '../../../../__mocks__/ward-patient';
import { useInpatientRequest } from '../hooks/useInpatientRequest';

jest.mock('@openmrs/esm-framework', () => {
  return {
    ...jest.requireActual('@openmrs/esm-framework'),
    launchWorkspace: jest.fn(),
  };
});

jest.mock('../hooks/useInpatientRequest', () => ({
  useInpatientRequest: jest.fn(),
}));
const mockInpatientRequestResponse = {
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  inpatientRequests: [mockInpatientRequest],
};
jest.mocked(useInpatientRequest).mockReturnValue(mockInpatientRequestResponse);

describe('Admission Requests Button', () => {
  it('call launch workspace when clicked on manage button', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AdmissionRequestsBar />);
    await user.click(screen.getByRole('button', { name: /manage/i }));
    expect(launchWorkspace).toHaveBeenCalled();
  });

  it('there should be one admission request', () => {
    const { getByText } = renderWithSwr(<AdmissionRequestsBar />);
    expect(getByText('1 admission requests')).toBeInTheDocument();
  });
});
