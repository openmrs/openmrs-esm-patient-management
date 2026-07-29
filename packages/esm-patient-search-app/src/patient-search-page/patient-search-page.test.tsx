import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import PatientSearchPageComponent from './patient-search-page.component';

const mockUseConfig = vi.mocked(useConfig<PatientSearchConfig>);
const mockUseLayoutType = vi.mocked(useLayoutType);

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual('react-router-dom')) as object),
  useParams: vi.fn(() => ({
    page: 1,
  })),
  useLocation: vi.fn(),
  useSearchParams: vi.fn(() => [
    {
      get: vi.fn(() => 'John'),
    },
  ]),
}));

describe('PatientSearchPageComponent', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        disableTabletSearchOnKeyUp: false,
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
            min: 0,
          },
          postcode: {
            enabled: true,
          },
          personAttributes: [
            {
              attributeTypeUuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
            },
          ],
        },
      } as PatientSearchConfig['search'],
    });
  });

  it('should render advanced search component on desktop layout', () => {
    render(<PatientSearchPageComponent />);

    const applyBtn = screen.getByRole('button', { name: /apply/i });
    const resetBtn = screen.getByRole('button', { name: /reset/i });

    expect(applyBtn).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();
  });

  it('should render patient search overlay on tablet layout', () => {
    mockUseLayoutType.mockReturnValue('tablet');
    render(<PatientSearchPageComponent />);

    const searchBtn = screen.getByRole('button', { name: /^search$/i });
    expect(searchBtn).toBeInTheDocument();
  });
});
