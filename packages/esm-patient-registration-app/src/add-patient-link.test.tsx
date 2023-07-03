import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import * as esmFramework from '@openmrs/esm-framework';
import Root from './add-patient-link';

describe('Add patient link component', () => {
  it('renders an "Add Patient" button and triggers navigation on click', () => {
    const navigateMock = jest.fn();
    jest.spyOn(esmFramework, 'navigate').mockImplementation(navigateMock);

    const { getByRole } = render(<Root />);
    const addButton = getByRole('button', { name: /add patient/i });

    fireEvent.click(addButton);

    expect(navigateMock).toHaveBeenCalledWith({ to: '${openmrsSpaBase}/patient-registration' });
  });
});
