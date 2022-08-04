import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientSearch from './patient-search.component';
import userEvent from '@testing-library/user-event';

describe('PatientSearch: ', () => {
  test('renders the patient search component in an overlay', () => {
    renderPatientSearch();

    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /search for a patient/i })).toBeInTheDocument();
  });
});

function renderPatientSearch() {
  const closePanel = jest.fn();
  render(<PatientSearch />);
}
