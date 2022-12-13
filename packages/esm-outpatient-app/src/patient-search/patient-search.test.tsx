import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientSearch from './patient-search.component';

describe('PatientSearch: ', () => {
  test('renders the patient search component in an overlay', async () => {
    const user = userEvent.setup();

    renderPatientSearch();
    // I have realiazed we can have 3 tests to be added in this component and I will add in a followup PR.
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
