import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import AddPatientToPatientListMenuItem from './add-patient-to-patient-list-menu-item.component';
import { showModal } from '@openmrs/esm-framework';

const mockedShowModal = showModal as jest.Mock;

jest.mock('@openmrs/esm-framework');

const patientUuid = '6baa7963-68ea-497e-b258-6fb82382bd07';

describe('AddPatientToPatientListMenuItem', () => {
  it('renders the button with the correct title', () => {
    render(<AddPatientToPatientListMenuItem patientUuid={patientUuid} />);
    const button = screen.getByRole('menuitem');

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Add to list');
    expect(button).toHaveAttribute('title', 'Add to list');
  });

  it('should open the modal on button click', async () => {
    render(<AddPatientToPatientListMenuItem patientUuid={patientUuid} />);
    const button = screen.getByRole('menuitem');

    fireEvent.click(button);

    expect(mockedShowModal).toHaveBeenCalledWith('add-patient-to-patient-list-modal', expect.any(Object));
  });
});
