import React from 'react';
import { render, screen } from '@testing-library/react';
import AdvancedSearch from './advanced-search.component';

describe('AdvancedSearch: ', () => {
  test('renders the advanced patient search in an overlay', () => {
    renderAdvancedSearch();

    expect(screen.getByRole('button', { name: /back to simple search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
    expect(screen.findAllByText(/any/i));
    expect(screen.getByRole('tab', { name: /^male$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^female$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /personal details/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /last visit/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /middle name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /phone number/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /post code/i })).toBeInTheDocument();
  });
});

function renderAdvancedSearch() {
  const toggleSearchType = jest.fn();
  render(<AdvancedSearch toggleSearchType={toggleSearchType} />);
}
