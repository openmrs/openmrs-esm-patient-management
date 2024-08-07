import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type PatientSearchConfig, configSchema } from './config-schema';
import PatientSearchRootComponent from './root.component';

const mockUseConfig = jest.mocked(useConfig<PatientSearchConfig>);

describe('PatientSearchRootComponent', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        disableTabletSearchOnKeyUp: false,
        patientResultUrl: '',
        showRecentlySearchedPatients: false,
      },
    });
  });

  afterAll(() => {
    window.history.pushState = originalPushState;
  });

  const originalPushState = window.history.pushState;

  it('should render PatientSearchPageComponent when accessing /search', () => {
    window.history.pushState({}, 'Patient Search', 'openmrs/spa/search');
    render(<PatientSearchRootComponent />);

    const patientSearchPage = screen.getByText('Search results');
    expect(patientSearchPage).toBeInTheDocument();
  });
});
