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

  // it.only('calls selectPatientAction when patient is selected', () => {
  //   const selectPatientMock = jest.fn();
  //   render(<PatientSearchButton selectPatientAction={selectPatientMock} />);

  //   const searchButton = screen.getByLabelText('Search Patient Button');
  //   screen.debug();

  //   fireEvent.click(searchButton);

  //   const overlayButton = screen.getByRole('button', { name: 'Search' });
  //   fireEvent.click(overlayButton);
  //   expect(selectPatientMock).toHaveBeenCalled();
  // });
});
