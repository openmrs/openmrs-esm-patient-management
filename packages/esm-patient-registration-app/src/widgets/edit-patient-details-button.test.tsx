import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { navigate } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/appointments.mock';
import EditPatientDetailsButton from './edit-patient-details-button.component';

describe('EditPatientDetailsButton', () => {
  const patientUuid = mockPatient.uuid;

  it('should navigate to the edit page when clicked', async () => {
    const user = userEvent.setup();
    const mockNavigate = navigate as jest.Mock;

    jest.mock('@openmrs/esm-framework', () => {
      const originalModule = jest.requireActual('@openmrs/esm-framework');
      return {
        ...originalModule,
      };
    });

    render(<EditPatientDetailsButton patientUuid={patientUuid} />);

    const button = screen.getByRole('menuitem');
    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith({ to: expect.stringContaining(`/patient/${patientUuid}/edit`) });
  });

  it('should call the onTransition function when provided', async () => {
    const user = userEvent.setup();

    const onTransitionMock = jest.fn();
    render(<EditPatientDetailsButton patientUuid={patientUuid} onTransition={onTransitionMock} />);

    const button = screen.getByRole('menuitem');
    await user.click(button);

    expect(onTransitionMock).toHaveBeenCalled();
  });
});
