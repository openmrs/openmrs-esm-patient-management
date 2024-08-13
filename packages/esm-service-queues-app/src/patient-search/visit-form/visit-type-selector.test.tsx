/* eslint-disable testing-library/no-node-access */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { mockVisitTypes } from '__mocks__';
import { useVisitTypes } from '@openmrs/esm-framework';
import { VisitTypeSelector } from './visit-type-selector.component';

const mockUseVisitTypes = jest.mocked(useVisitTypes);

describe('VisitTypeSelector', () => {
  beforeEach(() => {
    mockUseVisitTypes.mockReturnValue(mockVisitTypes);
  });

  it('renders visit types with no search bar if there are 5 or fewer', () => {
    const fewVisitTypes = mockVisitTypes.slice(0, 3);
    mockUseVisitTypes.mockReturnValue(fewVisitTypes);
    render(<VisitTypeSelector onChange={() => {}} />);

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();

    fewVisitTypes.forEach((visitType) => {
      const radioButton = screen.getByLabelText(visitType.display);
      expect(radioButton).toBeInTheDocument();
    });
  });

  it('renders the first 5 visit types with a search bar if there are more than 5', () => {
    render(<VisitTypeSelector onChange={() => {}} />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();

    mockVisitTypes.slice(0, 5).forEach((visitType) => {
      const radioButton = screen.getByLabelText(visitType.display);
      expect(radioButton).toBeInTheDocument();
    });
  });

  it('filters by search input and calls onChange', async () => {
    const user = userEvent.setup();

    const mockOnChange = jest.fn();
    render(<VisitTypeSelector onChange={mockOnChange} />);

    const searchInput = screen.getByRole('searchbox').closest('input');
    await user.type(searchInput, 'hiv');

    expect(searchInput.value).toBe('hiv');
    expect(screen.getByLabelText('HIV Return Visit')).toBeInTheDocument();
    expect(screen.getByLabelText('HIV Initial Visit')).toBeInTheDocument();
    expect(screen.queryByLabelText('Outpatient Visit')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Diabetes Clinic Visit')).not.toBeInTheDocument();

    expect(mockOnChange).toHaveBeenLastCalledWith(
      mockVisitTypes.filter((vt) => vt.display == 'HIV Return Visit')[0].uuid,
    );
  });

  it('calls onChange when a visit type is selected', async () => {
    const user = userEvent.setup();

    const mockOnChange = jest.fn();
    render(<VisitTypeSelector onChange={mockOnChange} />);

    const radioButton = screen.getByLabelText(mockVisitTypes[1].display).closest('input');
    await user.click(radioButton);
    expect(radioButton).toBeChecked();
    expect(mockOnChange).toHaveBeenLastCalledWith(mockVisitTypes[1].uuid);
  });

  it('allows changing the search input if no results are returned from a search', async () => {
    const user = userEvent.setup();

    render(<VisitTypeSelector onChange={() => {}} />);

    const searchInput: HTMLInputElement = screen.getByRole('searchbox');
    await user.type(searchInput, 'asdfasdf');

    const searchInputAfter: HTMLInputElement = screen.getByRole('searchbox');
    expect(searchInputAfter).toBeInTheDocument();
    expect(screen.getByText(/no visit types/i)).toBeInTheDocument();
  });
});
