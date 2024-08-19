import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, isDesktop, useConfig } from '@openmrs/esm-framework';
import { type PatientSearchConfig, configSchema } from '../config-schema';
import PatientSearchPageComponent from './patient-search-page.component';

const mockIsDesktop = jest.mocked(isDesktop);
const mockUseConfig = jest.mocked(useConfig<PatientSearchConfig>);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({
    page: 1,
  })),
  useLocation: jest.fn(),
  useSearchParams: jest.fn(() => [
    {
      get: jest.fn(() => 'John'),
    },
  ]),
}));

describe('PatientSearchPageComponent', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        disableTabletSearchOnKeyUp: false,
        patientResultUrl: configSchema.search.patientResultUrl._default,
        showRecentlySearchedPatients: false,
      },
    });
  });

  it('should render advanced search component on desktop layout', () => {
    mockIsDesktop.mockReturnValue(true);
    render(<PatientSearchPageComponent />);

    const applyBtn = screen.getByRole('button', { name: 'Apply' });
    const resetBtn = screen.getByRole('button', { name: /Reset/i });

    expect(applyBtn).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();
  });

  it('should render patient search overlay on tablet layout', () => {
    mockIsDesktop.mockReturnValue(false);
    render(<PatientSearchPageComponent />);

    const searchBtn = screen.getByRole('button', { name: 'Search' });
    expect(searchBtn).toBeInTheDocument();
  });
});
