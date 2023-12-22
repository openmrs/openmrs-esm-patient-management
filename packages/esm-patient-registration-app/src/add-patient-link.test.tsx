import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { navigate } from '@openmrs/esm-framework';
import Root from './add-patient-link';

const mockedNavigate = navigate as jest.Mock;

describe('Add patient link component', () => {
  it('renders an "Add Patient" button and triggers navigation on click', async () => {
    const user = userEvent.setup();

    const { getByRole } = render(<Root />);
    const addButton = getByRole('button', { name: /add patient/i });

    await user.click(addButton);

    expect(mockedNavigate).toHaveBeenCalledWith({ to: '${openmrsSpaBase}/patient-registration' });
  });
});
