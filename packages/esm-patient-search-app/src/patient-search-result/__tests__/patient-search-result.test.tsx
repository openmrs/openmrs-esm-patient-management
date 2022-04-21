import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientSearchResults from '../patient-search-result.component';
import { useConfig } from '@openmrs/esm-framework';
import { mockSearchResults } from './patient-search-mock-resource';

const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  formatDate: jest.fn(),
  parseDate: jest.fn(),
  useVisit: jest.fn(),
  age: jest.fn(),
  useConfig: jest.fn(),
  ExtensionSlot: jest.fn().mockImplementation(() => 'ExtensionSlot Component'),
}));

describe('PatientSearchResults: ', () => {
  it('should render patient banners in search results', async () => {
    const mockConfig = { search: {} };
    mockUseConfig.mockReturnValue(mockConfig);

    render(<PatientSearchResults patients={mockSearchResults} />);

    expect(screen.getByText(/Eric Test Ric/i)).toBeInTheDocument();
    expect(screen.getByText(/10000F1/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Covid Veerus/i)).toBeInTheDocument();
    expect(screen.getByText(/10000F2/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Actions/i).length).toBe(2);
    expect(screen.getAllByRole('button', { name: /^Show all details$/i }).length).toBe(2);
  });

  it('should not show Actions Menu in patient banner when toggled off in configuration', () => {
    const mockConfig = { search: { showActionsMenu: false } };
    mockUseConfig.mockReturnValue(mockConfig);

    render(<PatientSearchResults patients={mockSearchResults} />);

    expect(screen.queryByText(/Actions/i)).not.toBeInTheDocument();
  });
});
