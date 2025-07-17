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

    const addPatientToListButton = screen.getByRole('menuitem', { name: /add to list/i });
    expect(addPatientToListButton).toBeInTheDocument();
  });

  it('should open the modal on button click', async () => {
    const user = userEvent.setup();

    render(<AddPatientToPatientListMenuItem patientUuid={patientUuid} />);
    const addPatientToListButton = screen.getByRole('menuitem', { name: /add to list/i });

    await user.click(addPatientToListButton);

    expect(mockShowModal).toHaveBeenCalledWith('add-patient-to-patient-list-modal', {
      closeModal: expect.any(Function),
      size: 'sm',
      patientUuid: mockPatient.uuid,
    });
  });
});
