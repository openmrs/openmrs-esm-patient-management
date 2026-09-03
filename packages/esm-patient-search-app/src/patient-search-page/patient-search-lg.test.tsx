import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type SearchedPatient } from '../types';
import PatientSearchComponent from './patient-search-lg.component';

vi.mock('./patient-search-views.component', () => ({
  EmptyState: () => <div data-testid="empty" />,
  ErrorState: () => <div data-testid="error" />,
  LoadingState: () => <div data-testid="loading" />,
  PatientSearchResults: ({ searchResults }: { searchResults: Array<SearchedPatient> }) => (
    <div data-testid="results">{searchResults.map((p) => p.uuid).join(',')}</div>
  ),
}));

const makeResults = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => ({ uuid: `p-${i + offset}`, person: {} })) as Array<SearchedPatient>;

const firstShown = () => screen.getByTestId('results').textContent.split(',')[0];

describe('PatientSearchComponent pagination', () => {
  it('stays on the selected page when more server results are appended', async () => {
    const user = userEvent.setup();
    // 50 results at 20 per page (desktop) => 3 client pages
    const { rerender } = render(
      <PatientSearchComponent query="jos" searchResults={makeResults(50)} isLoading={false} fetchError={null} />,
    );

    expect(firstShown()).toBe('p-0');

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(firstShown()).toBe('p-20');

    // The eager prefetch in advanced-patient-search appends the next 50 server results.
    rerender(
      <PatientSearchComponent query="jos" searchResults={makeResults(100)} isLoading={false} fetchError={null} />,
    );

    expect(firstShown()).toBe('p-20');
  });

  it('resets to page 1 when the query changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PatientSearchComponent query="jos" searchResults={makeResults(50)} isLoading={false} fetchError={null} />,
    );

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(firstShown()).toBe('p-20');

    rerender(
      <PatientSearchComponent query="mary" searchResults={makeResults(50)} isLoading={false} fetchError={null} />,
    );

    expect(firstShown()).toBe('p-0');
  });

  it('resets to page 1 when a refine filter leaves the selected page out of range', async () => {
    const user = userEvent.setup();
    // 50 results at 20 per page => 3 client pages.
    const { rerender } = render(
      <PatientSearchComponent query="jos" searchResults={makeResults(50)} isLoading={false} fetchError={null} />,
    );

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(firstShown()).toBe('p-40');

    // Refine-search filters run on the client under the same query, so only the row count changes.
    // Page 3 no longer exists in a 10-row result set.
    rerender(
      <PatientSearchComponent query="jos" searchResults={makeResults(10)} isLoading={false} fetchError={null} />,
    );

    expect(screen.queryByTestId('empty')).not.toBeInTheDocument();
    expect(firstShown()).toBe('p-0');
  });
});
