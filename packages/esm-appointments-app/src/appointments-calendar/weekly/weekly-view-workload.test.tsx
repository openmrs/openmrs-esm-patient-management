import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { CalendarType } from '../../types';
import { spaBasePath } from '../../constants';
import { navigate } from '@openmrs/esm-framework';
import WeeklyWorkloadView from './weekly-view-workload.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  navigate: jest.fn(),
  useLayoutType: jest.fn(),
}));

describe('WeeklyWorkloadView Component', () => {
  const mockData = {
    type: 'weekly' as CalendarType,
    dateTime: dayjs('2023-08-17'),
    currentDate: dayjs('2023-08-17'),
    events: [
      {
        appointmentDate: '2023-08-17',
        service: [
          { serviceName: 'HIV', count: 2 },
          { serviceName: 'Lab testing', count: 3 },
        ],
      },
    ],
    index: 1,
  };

  it('renders properly when type is "weekly"', () => {
    render(<WeeklyWorkloadView {...mockData} />);

    expect(screen.getByText('All Day')).toBeInTheDocument();
    expect(screen.getByText('HIV')).toBeInTheDocument();
    expect(screen.getByText('Lab testing')).toBeInTheDocument();
  });

  it('navigates when a service area is clicked', async () => {
    const user = userEvent.setup();

    render(<WeeklyWorkloadView {...mockData} />);

    await user.click(screen.getByText('HIV'));

    expect(navigate).toHaveBeenCalledWith({
      to: `${spaBasePath}/appointments/list/Thu, 17 Aug 2023 00:00:00 GMT/HIV`,
    });
  });

  it('calculates and displays the total count correctly', () => {
    render(<WeeklyWorkloadView {...mockData} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
