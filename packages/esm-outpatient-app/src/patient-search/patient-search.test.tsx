import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientSearch from './patient-search.component';

describe('PatientSearch: ', () => {
  test('renders the patient search component in an overlay', async () => {
    const user = userEvent.setup();

    renderPatientSearch();

    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
    const advancedSearchButton = screen.getByRole('button', { name: /advanced search/i });
    expect(advancedSearchButton).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /search for a patient/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /advanced search/i })).toBeDisabled();
  });
});

function renderPatientSearch() {
  const closePanel = jest.fn();
  render(
    <PatientSearch
      closePanel={closePanel}
      viewState={{
        selectedPatientUuid: '',
      }}
    />,
  );
}
