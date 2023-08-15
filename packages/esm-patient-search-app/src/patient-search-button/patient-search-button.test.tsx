import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import PatientSearchButton from './patient-search-button.component';

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

  it('displays overlay when button is clicked', () => {
    render(<PatientSearchButton />);

    const searchButton = screen.getByLabelText('Search Patient Button');

    fireEvent.click(searchButton);

    const overlayHeader = screen.getByText('Search results');

    expect(overlayHeader).toBeInTheDocument();
  });
});
