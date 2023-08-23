import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import PatientListActionButton from './patient-list-action-button.component';
import { navigate, useLayoutType } from '@openmrs/esm-framework';

const mockedNavigate = navigate as jest.Mock;
const mockedUseLayoutType = useLayoutType as jest.Mock;

jest.mock('@openmrs/esm-framework');

describe('PatientListActionButton', () => {
  it('renders the button with the correct label', () => {
    render(<PatientListActionButton />);
    const button = screen.getByRole('button');
    const label = screen.getByText('Patient lists');

    expect(button).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('navigates to patient list page when clicked', () => {
    mockedNavigate.mockImplementation(() => {});
    mockedUseLayoutType.mockImplementation(() => 'desktop');

    render(<PatientListActionButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(mockedNavigate).toHaveBeenCalledWith({ to: '${openmrsSpaBase}/home/patient-lists' });
  });

  it('renders tablet layout button when layout is tablet', () => {
    mockedUseLayoutType.mockImplementation(() => 'tablet');

    render(<PatientListActionButton />);
    const button = screen.getByRole('button');
    const label = screen.getByText('Patient lists');

    expect(button).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });
});
