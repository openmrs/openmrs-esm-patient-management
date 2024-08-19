import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { showModal } from '@openmrs/esm-framework';
import { mockPatient } from '__mocks__';
import AddPatientToPatientListMenuItem from './add-patient-to-patient-list-menu-item.component';

const patientUuid = mockPatient.uuid;
const mockShowModal = jest.mocked(showModal);

describe('AddPatientToPatientListMenuItem', () => {
  it('renders the button with the correct title', () => {
    render(<AddPatientToPatientListMenuItem patientUuid={patientUuid} />);
    const button = screen.getByRole('menuitem');

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Add to list');
    expect(button).toHaveAttribute('title', 'Add to list');
  });

  it('should open the modal on button click', async () => {
    const user = userEvent.setup();

    render(<AddPatientToPatientListMenuItem patientUuid={patientUuid} />);
    const button = screen.getByRole('menuitem');

    await user.click(button);

    expect(mockShowModal).toHaveBeenCalledWith('add-patient-to-patient-list-modal', expect.any(Object));
  });
});
