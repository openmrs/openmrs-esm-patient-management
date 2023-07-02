import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import EditPatientDetailsButton from './edit-patient-details-button.component';
import * as esmFramework from '@openmrs/esm-framework';

describe('EditPatientDetailsButton', () => {
  it('should navigate to the edit page when clicked', () => {
    const navigateMock = jest.fn();
    jest.spyOn(esmFramework, 'navigate').mockImplementation(navigateMock);

    const patientUuid = '12345';
    const { getByRole } = render(<EditPatientDetailsButton patientUuid={patientUuid} />);

    const button = getByRole('menuitem');
    fireEvent.click(button);

    expect(navigateMock).toHaveBeenCalledWith({ to: expect.stringContaining(`/patient/${patientUuid}/edit`) });
  });

  it('should call the onTransition function when provided', () => {
    const patientUuid = '12345';
    const onTransitionMock = jest.fn();
    const { getByRole } = render(
      <EditPatientDetailsButton patientUuid={patientUuid} onTransition={onTransitionMock} />,
    );

    const button = getByRole('menuitem');
    fireEvent.click(button);

    expect(onTransitionMock).toHaveBeenCalled();
  });
});
