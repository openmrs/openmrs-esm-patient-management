import React from 'react';
import { render, screen } from '@testing-library/react';
import BasicSearch from './basic-search.component';

describe('BasicSearch: ', () => {
  test('renders the basic patient search in an overlay', () => {
    renderBasicSearch();

    const searchbox = screen.getByRole('searchbox', { name: /search for a patient/i });
    const searchButton = screen.getByRole('button', { name: /^search$/i });
    expect(searchbox).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search for a patient name or id number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /advanced search/i })).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
    expect(screen.getByText(/type the patient's name or unique id number/i)).toBeInTheDocument();
  });
});

function renderBasicSearch() {
  const toggleSearchType = jest.fn();
  render(<BasicSearch toggleSearchType={toggleSearchType} />);
}
