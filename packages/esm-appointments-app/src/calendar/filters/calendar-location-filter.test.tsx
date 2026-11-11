import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useLocations } from '@openmrs/esm-framework';
import { mockLocationInpatientWard, mockLocationMosoriot } from '__mocks__';
import CalendarLocationFilter from './calendar-location-filter.component';

const mockUseLocations = vi.mocked(useLocations);
const mockOnChange = vi.fn();

describe('CalendarLocationFilter', () => {
  beforeEach(() => {
    mockUseLocations.mockReturnValue([mockLocationMosoriot, mockLocationInpatientWard]);
  });

  it('reads "All locations" when no location is selected', () => {
    render(<CalendarLocationFilter selectedLocationUuids={[]} onChange={mockOnChange} />);

    expect(screen.getByRole('combobox', { name: /location/i })).toHaveTextContent('All locations');
  });

  it('offers the locations where appointments can be booked and reports the one that gets selected', async () => {
    const user = userEvent.setup();
    render(<CalendarLocationFilter selectedLocationUuids={[]} onChange={mockOnChange} />);

    expect(mockUseLocations).toHaveBeenCalledWith('Appointment Location');

    await user.click(screen.getByRole('combobox', { name: /location/i }));
    expect(screen.getByRole('option', { name: 'Mosoriot' })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Inpatient Ward' }));

    expect(mockOnChange).toHaveBeenCalledWith([mockLocationInpatientWard.uuid]);
  });

  it('summarises the selection and clears it from the count tag', async () => {
    const user = userEvent.setup();
    render(<CalendarLocationFilter selectedLocationUuids={[mockLocationInpatientWard.uuid]} onChange={mockOnChange} />);

    expect(screen.getByRole('combobox', { name: /location/i })).toHaveTextContent('1 location');

    await user.click(screen.getByRole('button', { name: /clear all selected items/i }));

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
