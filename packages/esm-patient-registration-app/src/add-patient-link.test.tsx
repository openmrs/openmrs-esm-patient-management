import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { navigate } from '@openmrs/esm-framework';
import Root from './add-patient-link';

const mockNavigate = jest.mocked(navigate);

describe('Add patient link component', () => {
  it('renders an "Add Patient" button and triggers navigation on click', async () => {
    const user = userEvent.setup();
    render(<Root />);
    await user.click(screen.getByRole('button', { name: /add patient/i }));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '${openmrsSpaBase}/patient-registration' });
  });
});
