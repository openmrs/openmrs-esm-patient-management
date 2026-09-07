import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type SearchedPatient } from '../types';
import PatientSearchComponent from './patient-search-lg.component';

// The framework mock hides the banner's contents, so render each result as its name. The other views are real.
vi.mock('./patient-search-views.component', async () => ({
  ...((await vi.importActual('./patient-search-views.component')) as object),
  PatientSearchResults: ({ searchResults }: { searchResults: Array<SearchedPatient> }) => (
    <>
      {searchResults.map((patient) => (
        <div key={patient.uuid}>{patient.person.personName.display}</div>
      ))}
    </>
  ),
}));

const makeResults = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    uuid: `p-${i}`,
    person: { personName: { display: `Patient ${i}` } },
  })) as Array<SearchedPatient>;

const search = (searchResults: Array<SearchedPatient>, query = 'jos') => (
  <PatientSearchComponent query={query} searchResults={searchResults} isLoading={false} fetchError={null} />
);

describe('PatientSearchComponent pagination', () => {
  it('stays on the selected page when more server results are appended', async () => {
    const user = userEvent.setup();
    // 50 results at 20 per page (desktop) => 3 client pages
    const { rerender } = render(search(makeResults(50)));

    expect(screen.getByText('Patient 0')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('Patient 20')).toBeInTheDocument();
    expect(screen.queryByText('Patient 0')).not.toBeInTheDocument();

    // The eager prefetch in advanced-patient-search appends the next 50 server results.
    rerender(search(makeResults(100)));

    expect(screen.getByRole('heading', { name: /100 search result/ })).toBeInTheDocument();
    expect(screen.getByText('Patient 20')).toBeInTheDocument();
    expect(screen.queryByText('Patient 0')).not.toBeInTheDocument();
  });

  it('resets to page 1 when the query changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(search(makeResults(50)));

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('Patient 20')).toBeInTheDocument();

    rerender(search(makeResults(50), 'mary'));

    expect(screen.getByText('Patient 0')).toBeInTheDocument();
    expect(screen.queryByText('Patient 20')).not.toBeInTheDocument();
  });

  it('resets to page 1 when a refine filter leaves the selected page out of range', async () => {
    const user = userEvent.setup();
    const { rerender } = render(search(makeResults(50)));

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByText('Patient 40')).toBeInTheDocument();

    // A refine filter narrows the rows under the same query. Page 3 no longer exists in 10 rows.
    rerender(search(makeResults(10)));

    expect(screen.getByRole('heading', { name: /10 search result/ })).toBeInTheDocument();
    expect(screen.queryByText(/no patient charts were found/i)).not.toBeInTheDocument();
    expect(screen.getByText('Patient 0')).toBeInTheDocument();
  });
});
