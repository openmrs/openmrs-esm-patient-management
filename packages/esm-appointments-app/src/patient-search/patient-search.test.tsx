import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientSearch from './patient-search.component';
import userEvent from '@testing-library/user-event';

describe('PatientSearch: ', () => {
  test('renders the patient search component in an overlay', async () => {
    const user = userEvent.setup();

    renderPatientSearch();

    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
    const advancedSearchButton = screen.getByRole('button', { name: /advanced search/i });
    expect(advancedSearchButton).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /search for a patient/i })).toBeInTheDocument();

    await user.click(advancedSearchButton);

    expect(advancedSearchButton).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to simple search/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back to simple search/i }));

    expect(screen.getByRole('button', { name: /advanced search/i })).toBeInTheDocument();
  });
});

function renderPatientSearch() {
  render(<PatientSearch />);
}
