import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { type Location, useLocations } from '@openmrs/esm-framework';
import CalendarLocationFilter from './calendar-location-filter.component';

const mockUseLocations = vi.mocked(useLocations);

const outpatientClinic = { uuid: 'location-outpatient', display: 'Outpatient Clinic' } as Location;
const mobileClinic = { uuid: 'location-mobile', display: 'Mobile Clinic' } as Location;

describe('CalendarLocationFilter', () => {
  beforeEach(() => {
    mockUseLocations.mockReturnValue([outpatientClinic, mobileClinic]);
  });

  it('shows "All locations" when nothing is selected', () => {
    render(<CalendarLocationFilter selectedLocationUuids={[]} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: /^location$/i })).toBeInTheDocument();
    expect(screen.getByText('All locations')).toBeInTheDocument();
  });

  it('lists the appointment locations sorted by name when opened', async () => {
    const user = userEvent.setup();
    render(<CalendarLocationFilter selectedLocationUuids={[]} onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox', { name: /^location$/i }));

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual(['Mobile Clinic', 'Outpatient Clinic']);
    expect(mockUseLocations).toHaveBeenCalledWith('Appointment Location');
  });

  it('shows the number of selected locations in the trigger label', () => {
    render(
      <CalendarLocationFilter selectedLocationUuids={[outpatientClinic.uuid, mobileClinic.uuid]} onChange={vi.fn()} />,
    );

    expect(screen.getByText('2 location(s)')).toBeInTheDocument();
    expect(screen.queryByText('All locations')).not.toBeInTheDocument();
  });
});
