import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import PatientSearchBar from './patient-search-bar.component';

describe('PatientSearchBar', () => {
  it('renders a search input', () => {
    render(<PatientSearchBar onClear={jest.fn()} onSubmit={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search for a patient by name or identifier number');

    expect(searchInput).toBeInTheDocument();
  });

  it('displays the initial search term', () => {
    const initialSearchTerm = 'John Doe';
    render(<PatientSearchBar initialSearchTerm={initialSearchTerm} onClear={jest.fn()} onSubmit={jest.fn()} />);

    const searchInput: HTMLInputElement = screen.getByPlaceholderText(
      'Search for a patient by name or identifier number',
    );

    expect(searchInput.value).toBe(initialSearchTerm);
  });

  it('calls the onChange callback on input change', async () => {
    const user = userEvent.setup();
    const onChangeMock = jest.fn();

    render(<PatientSearchBar onChange={onChangeMock} onClear={jest.fn()} onSubmit={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search for a patient by name or identifier number');

    await user.type(searchInput, 'New Value');

    expect(onChangeMock).toHaveBeenCalledWith('New Value');
  });

  it('calls the onClear callback on clear button click', async () => {
    const user = userEvent.setup();
    const onClearMock = jest.fn();

    render(<PatientSearchBar onClear={onClearMock} onSubmit={jest.fn()} />);

    const clearButton = screen.getByRole('button', { name: 'Clear' });

    await user.click(clearButton);

    expect(onClearMock).toHaveBeenCalled();
  });

  it('calls the onSubmit callback on form submission', async () => {
    const user = userEvent.setup();
    const onSubmitMock = jest.fn();

    render(<PatientSearchBar onSubmit={onSubmitMock} onClear={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search for a patient by name or identifier number');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    await user.type(searchInput, 'Search Term');
    await user.click(searchButton);

    expect(onSubmitMock).toHaveBeenCalledWith('Search Term');

    
  });

  it('custom clear button clears input and calls onClear', async () => {
  const user = userEvent.setup();
  const onClearMock = jest.fn();

  render(<PatientSearchBar onClear={onClearMock} onSubmit={jest.fn()} />);

  const searchInput = screen.getByPlaceholderText(
    'Search for a patient by name or identifier number',
  );

  await user.type(searchInput, 'John');

  // get all clear buttons (carbon + custom)
  const clearButtons = screen.getAllByText('Clear');

  // click last one (your custom button)
  await user.click(clearButtons[clearButtons.length - 1]);

  expect(onClearMock).toHaveBeenCalled();
});
});
