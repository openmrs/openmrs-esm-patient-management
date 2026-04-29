import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePagination } from '@openmrs/esm-framework';
import PatientSearchComponent from './patient-search-lg.component';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string, options?: any) => {
      if (key === 'searchResultsCount' && options) {
        return `${options.count} search result`;
      }
      return fallback;
    },
  }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  usePagination: jest.fn(),
}));

jest.mock('./patient-search-views.component', () => ({
  EmptyState: () => <div data-testid="empty-state">Empty State</div>,
  ErrorState: () => <div data-testid="error-state">Error State</div>,
  LoadingState: () => <div data-testid="loading-state">Loading State</div>,
  PatientSearchResults: ({ searchResults }) => (
    <div data-testid="patient-search-results">
      {searchResults.map((r: any) => (
        <span key={r.uuid}>{r.name}</span>
      ))}
    </div>
  ),
}));

jest.mock('../ui-components/pagination/pagination.component', () => {
  return jest.fn(({ currentPage, totalPages }) => (
    <div data-testid="pagination">
      Page {currentPage} of {totalPages}
    </div>
  ));
});

const mockUsePagination = jest.mocked(usePagination);

describe('PatientSearchComponent (LG)', () => {
  const defaultProps = {
    query: '',
    searchResults: [],
    isLoading: false,
    fetchError: null,
  };

  const mockGoTo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePagination.mockReturnValue({
      results: [],
      goTo: mockGoTo,
      totalPages: 1,
      currentPage: 1,
      showNextButton: false,
      paginated: false,
    } as any);
  });

  it('renders LoadingState when isLoading is true', () => {
    render(<PatientSearchComponent {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Searching...' })).toBeInTheDocument();
  });

  it('renders ErrorState when fetchError is present', () => {
    render(<PatientSearchComponent {...defaultProps} fetchError={new Error('Failed')} />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('renders EmptyState when there are no results and not loading', () => {
    render(<PatientSearchComponent {...defaultProps} searchResults={[]} />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '0 search result' })).toBeInTheDocument();
  });

  it('renders PatientSearchResults when results exist', () => {
    const searchResults = [{ uuid: '1', name: 'John Doe' }];
    mockUsePagination.mockReturnValue({
      results: searchResults,
      goTo: mockGoTo,
      totalPages: 1,
      currentPage: 1,
      showNextButton: false,
      paginated: false,
    } as any);

    render(<PatientSearchComponent {...defaultProps} searchResults={searchResults as any} />);

    expect(screen.getByTestId('patient-search-results')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1 search result' })).toBeInTheDocument();
  });

  it('calls goTo(1) when query changes', () => {
    const { rerender } = render(<PatientSearchComponent {...defaultProps} query="a" />);
    expect(mockGoTo).toHaveBeenCalledWith(1);

    rerender(<PatientSearchComponent {...defaultProps} query="ab" />);
    expect(mockGoTo).toHaveBeenCalledTimes(2); // Initial mount + query change
  });

  it('renders pagination when paginated is true', () => {
    mockUsePagination.mockReturnValue({
      results: [],
      goTo: mockGoTo,
      totalPages: 2,
      currentPage: 1,
      showNextButton: true,
      paginated: true,
    } as any);

    render(<PatientSearchComponent {...defaultProps} />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('uses different resultsToShow based on inTabletOrOverlay', () => {
    render(<PatientSearchComponent {...defaultProps} inTabletOrOverlay={true} />);
    expect(mockUsePagination).toHaveBeenCalledWith([], 15);

    jest.clearAllMocks();
    render(<PatientSearchComponent {...defaultProps} inTabletOrOverlay={false} />);
    expect(mockUsePagination).toHaveBeenCalledWith([], 20);
  });
});
