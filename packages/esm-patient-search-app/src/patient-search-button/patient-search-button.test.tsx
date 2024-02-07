import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import PatientSearchButton from './patient-search-button.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn().mockReturnValue({ search: { disableTabletSearchOnKeyUp: false } }),
}));

describe('PatientSearchButton', () => {
  it('renders with default props', () => {
    render(<PatientSearchButton />);

    const searchButton = screen.getByLabelText('Search Patient Button');

    expect(searchButton).toBeInTheDocument();
  });

  it('displays custom buttonText', () => {
    render(<PatientSearchButton buttonText="Custom Text" />);

    const customButton = screen.getByText('Custom Text');

    expect(customButton).toBeInTheDocument();
  });

  it('displays overlay when button is clicked', async () => {
    const user = userEvent.setup();

    render(<PatientSearchButton />);

    const searchButton = screen.getByLabelText('Search Patient Button');

    await user.click(searchButton);

    const overlayHeader = screen.getByText('Search results');

    expect(overlayHeader).toBeInTheDocument();
  });
});
