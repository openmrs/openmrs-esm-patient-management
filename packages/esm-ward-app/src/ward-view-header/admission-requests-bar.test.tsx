import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { mockInpatientRequest } from '__mocks__';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import AdmissionRequestsBar from './admission-requests-bar.component';

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
    renderWithSwr(<AdmissionRequestsBar />);

    expect(screen.getByText('1 admission requests')).toBeInTheDocument();
  });
});
