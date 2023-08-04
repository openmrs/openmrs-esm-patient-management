import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { age } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../tools/test-helpers';
import PatientInfo from './patient-info.component';

const mockAge = age as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    age: jest.fn(),
  };
});

describe('Patient Info', () => {
  test('should render patient info correctly', async () => {
    const user = userEvent.setup();

    mockAge.mockReturnValue(35);

    renderPatientInfo();

    expect(screen.getByText(/John Wilson/)).toBeInTheDocument();
    expect(screen.getByText(/35/)).toBeInTheDocument();
    expect(screen.getByText(/Male/i)).toBeInTheDocument();
    expect(screen.getByText(/04 — Apr — 1972/i)).toBeInTheDocument();
    expect(screen.getByText(/100732HE, 100GEJ/i)).toBeInTheDocument();

    const showDetailsButton = screen.getByRole('button', { name: /Show all details/ });
    expect(showDetailsButton).toBeInTheDocument();

    await user.click(showDetailsButton);

    expect(screen.queryByRole('button', { name: /Show all details/ })).not.toBeInTheDocument();
    const showLessButton = screen.getByRole('button', { name: /Show less/i });
    expect(showLessButton).toBeInTheDocument();
  });
});

const renderPatientInfo = () => {
  render(<PatientInfo handlePatientInfoClick={() => {}} patient={mockPatient} />);
};
