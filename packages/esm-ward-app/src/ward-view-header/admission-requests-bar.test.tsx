import { launchWorkspace, useAppContext } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithSwr } from 'tools';
import { mockWardPatientGroupDetails } from '../../mock';
import AdmissionRequestsBar from './admission-requests-bar.component';

jest.mocked(useAppContext).mockReturnValue(mockWardPatientGroupDetails());

describe('Admission Requests Button', () => {
  it('should launch workspace when clicked on manage button', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AdmissionRequestsBar />);

    await user.click(screen.getByRole('button', { name: /manage/i }));
    expect(launchWorkspace).toHaveBeenCalled();
  });

  it('should have one admission request', () => {
    renderWithSwr(<AdmissionRequestsBar />);

    expect(screen.getByText('1 admission request')).toBeInTheDocument();
  });
});
