import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import EditPatientDetailsButton from './edit-patient-details-button.component';
import { navigate } from '@openmrs/esm-framework';

describe('EditPatientDetailsButton', () => {
  it('should navigate to the edit page when clicked', () => {
    const mockNavigate = navigate as jest.Mock;
    jest.mock('@openmrs/esm-framework', () => {
      const originalModule = jest.requireActual('@openmrs/esm-framework');
      return {
        ...originalModule,
      };
    });

    const patientUuid = '12345';
    render(<EditPatientDetailsButton patientUuid={patientUuid} />);

    const button = screen.getByRole('menuitem');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith({ to: expect.stringContaining(`/patient/${patientUuid}/edit`) });
  });

  it('should call the onTransition function when provided', () => {
    const patientUuid = '12345';
    const onTransitionMock = jest.fn();
    render(<EditPatientDetailsButton patientUuid={patientUuid} onTransition={onTransitionMock} />);

    const button = screen.getByRole('menuitem');
    fireEvent.click(button);

    expect(onTransitionMock).toHaveBeenCalled();
  });
});
