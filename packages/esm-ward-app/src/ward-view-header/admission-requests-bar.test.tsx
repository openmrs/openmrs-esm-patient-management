import userEvent from '@testing-library/user-event';
import { renderWithSwr } from '../../../../tools/test-utils';
import { screen } from '@testing-library/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import AdmissionRequests from './admission-requests-bar.component';

jest.mock('@openmrs/esm-framework', () => {
  return {
    ...jest.requireActual('@openmrs/esm-framework'),
    launchWorkspace: jest.fn(),
  };
});

describe('Admission Requests Button', () => {
  it('call launch workspace when clicked on manage button', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AdmissionRequests />);
    await user.click(screen.getByRole('button', { name: /manage/i }));
    expect(launchWorkspace).toHaveBeenCalled();
  });
});
