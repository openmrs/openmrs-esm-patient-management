import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientSearchRootComponent from './root.component';

describe('PatientSearchRootComponent', () => {
  const originalPushState = window.history.pushState;

  // Restore the original pushState after all tests
  afterAll(() => {
    window.history.pushState = originalPushState;
  });
  it('should render PatientSearchPageComponent when accessing /search', () => {
    window.history.pushState({}, 'Patient Search', 'openmrs/spa/search');
    render(<PatientSearchRootComponent />);

    const patientSearchPage = screen.getByText('Search results');
    expect(patientSearchPage).toBeInTheDocument();
  });
});
