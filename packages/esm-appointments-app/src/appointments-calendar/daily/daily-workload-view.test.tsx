import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { navigate } from '@openmrs/esm-framework';
import DailyWorkloadView from './daily-workload-view.component';
import { spaBasePath } from '../../constants';
import { type CalendarType, DailyAppointmentsCountByService } from '../../types';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  navigate: jest.fn(),
  useLayoutType: jest.fn(),
}));

describe('DailyWorkloadView Component', () => {
  const events: Array<DailyAppointmentsCountByService> = [
    {
      appointmentDate: '2023-08-18',
      services: [
        { serviceName: 'HIV', count: 2 },
        { serviceName: 'Lab testing', count: 3 },
      ],
    },
  ];

  const mockData = {
    type: 'daily' as CalendarType,
    dateTime: dayjs('2023-08-18'),
    currentDate: dayjs('2023-08-18'),
    events: events,
  };

  it('renders properly when type is "daily"', () => {
    render(<DailyWorkloadView {...mockData} />);

    expect(screen.getByText('All Day')).toBeInTheDocument();
    expect(screen.getByText('HIV')).toBeInTheDocument();
    expect(screen.getByText('Lab testing')).toBeInTheDocument();
  });

  it('navigates when a service area is clicked', async () => {
    const user = userEvent.setup();

    render(<DailyWorkloadView {...mockData} />);

    await user.click(screen.getByText('HIV'));

    expect(navigate).toHaveBeenCalledWith({
      to: `${spaBasePath}/appointments/list/Fri, 18 Aug 2023 00:00:00 GMT/HIV`,
    });
  });

  it('calculates and displays the total count correctly', () => {
    render(<DailyWorkloadView {...mockData} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
t
