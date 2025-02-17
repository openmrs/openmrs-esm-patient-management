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
        patientChartUrl: '',
        showRecentlySearchedPatients: false,
        searchFilterFields: {
          gender: {
            enabled: true,
          },
          dateOfBirth: {
            enabled: true,
          },
          age: {
            enabled: true,
          },
        },
      },
    } as PatientSearchConfig);
  });

  afterAll(() => {
    window.history.pushState = originalPushState;
  });

  const originalPushState = window.history.pushState;

  it('should render PatientSearchPageComponent when accessing /search', () => {
    window.history.pushState({}, 'Patient Search', 'openmrs/spa/search');
    render(<PatientSearchRootComponent />);

    expect(screen.getByRole('heading', { name: /refine search/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /any/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^male$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /female/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /other/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /unknown/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset fields/i })).toBeInTheDocument();
  });
});
