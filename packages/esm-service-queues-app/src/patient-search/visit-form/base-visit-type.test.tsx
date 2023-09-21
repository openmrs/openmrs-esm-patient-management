import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseVisitType from './base-visit-type.component';
import { mockVisitTypes } from '../../../__mocks__/visits.mock';

jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: () => 'desktop',
  usePagination: jest.fn(() => ({ results: mockVisitTypes, currentPage: 1, goTo: jest.fn() })),
}));

describe('BaseVisitType', () => {
  it('renders visit types correctly', () => {
    render(<BaseVisitType onChange={() => {}} visitTypes={mockVisitTypes} />);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();

    mockVisitTypes.forEach((visitType) => {
      const radioButton = screen.getByLabelText(visitType.display);
      expect(radioButton).toBeInTheDocument();
    });
  });

  it('handles search input correctly', () => {
    render(<BaseVisitType onChange={() => {}} visitTypes={mockVisitTypes} />);

    const searchInput: HTMLInputElement = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'Visit Type 1' } });

    expect(searchInput.value).toBe('Visit Type 1');
  });

  it('calls onChange when a visit type is selected', () => {
    const mockOnChange = jest.fn();
    render(<BaseVisitType onChange={mockOnChange} visitTypes={mockVisitTypes} />);

    const radioButton: HTMLInputElement = screen.getByLabelText(mockVisitTypes[0].display);
    fireEvent.click(radioButton);
    expect(radioButton.checked).toBe(true);
  });
});
