/**
 * @vitest-environment jsdom
 *
 * The form-submit flow under test does not fire its callback under happy-dom
 * (likely a DOM-event-dispatch divergence). Run this file under jsdom.
 */
import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import PatientSearchBar from './patient-search-bar.component';

describe('PatientSearchBar', () => {
  it('renders a search input', () => {
    render(<PatientSearchBar onClear={vi.fn()} onSubmit={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search for a patient by name or identifier number');

    expect(searchInput).toBeInTheDocument();
  });

  it('displays the initial search term', () => {
    const initialSearchTerm = 'John Doe';
    render(<PatientSearchBar initialSearchTerm={initialSearchTerm} onClear={vi.fn()} onSubmit={vi.fn()} />);

    const searchInput: HTMLInputElement = screen.getByPlaceholderText(
      'Search for a patient by name or identifier number',
    );

    expect(searchInput.value).toBe(initialSearchTerm);
  });

  it('calls the onChange callback on input change', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();

    render(<PatientSearchBar onChange={onChangeMock} onClear={vi.fn()} onSubmit={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search for a patient by name or identifier number');

    await user.type(searchInput, 'New Value');

    expect(onChangeMock).toHaveBeenCalledWith('New Value');
  });

  it('calls the onClear callback on clear button click', async () => {
    const user = userEvent.setup();
    const onClearMock = vi.fn();

    render(<PatientSearchBar onClear={onClearMock} onSubmit={vi.fn()} />);

    const clearButton = screen.getByRole('button', { name: 'Clear' });

    await user.click(clearButton);

    expect(onClearMock).toHaveBeenCalled();
  });

  it('calls the onSubmit callback on form submission', async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    render(<PatientSearchBar onSubmit={onSubmitMock} onClear={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search for a patient by name or identifier number');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    await user.type(searchInput, 'Search Term');
    await user.click(searchButton);

    expect(onSubmitMock).toHaveBeenCalledWith('Search Term');
  });
});
