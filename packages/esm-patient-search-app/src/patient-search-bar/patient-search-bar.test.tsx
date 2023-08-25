import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import PatientSearchBar from './patient-search-bar.component';

describe('PatientSearchBar', () => {
  it('should render', () => {
    render(<PatientSearchBar onClear={jest.fn()} onSubmit={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search for a patient by name or identifier number');

    expect(searchInput).toBeInTheDocument();
  });

  it('displays initial search term', () => {
    const initialSearchTerm = 'John Doe';
    render(<PatientSearchBar initialSearchTerm={initialSearchTerm} onClear={jest.fn()} onSubmit={jest.fn()} />);

    const searchInput: HTMLInputElement = screen.getByPlaceholderText(
      'Search for a patient by name or identifier number',
    );

    expect(searchInput.value).toBe(initialSearchTerm);
  });

  it('calls onChange callback on input change', () => {
    const onChangeMock = jest.fn();
    render(<PatientSearchBar onChange={onChangeMock} onClear={jest.fn()} onSubmit={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search for a patient by name or identifier number');

    fireEvent.change(searchInput, { target: { value: 'New Value' } });

    expect(onChangeMock).toHaveBeenCalledWith('New Value');
  });

  it('calls onClear callback on clear button click', () => {
    const onClearMock = jest.fn();
    render(<PatientSearchBar onClear={onClearMock} onSubmit={jest.fn()} />);

    const clearButton = screen.getByRole('button', { name: 'Clear' });

    fireEvent.click(clearButton);

    expect(onClearMock).toHaveBeenCalled();
  });

  it('calls onSubmit callback on form submission', () => {
    const onSubmitMock = jest.fn();
    render(<PatientSearchBar onSubmit={onSubmitMock} onClear={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search for a patient by name or identifier number');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(searchInput, { target: { value: 'Search Term' } });
    fireEvent.click(searchButton);

    expect(onSubmitMock).toHaveBeenCalledWith('Search Term');
  });
});
