import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import { navigate } from '@openmrs/esm-framework';
import DailyWorkloadView from './daily-view-workload.component';
import { spaBasePath } from '../../constants';
import { CalendarType } from '../../types';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  navigate: jest.fn(),
  useLayoutType: jest.fn(),
}));

describe('DailyWorkloadView Component', () => {
  const mockData = {
    type: 'daily' as CalendarType,
    dateTime: dayjs('2023-08-18'),
    currentDate: dayjs('2023-08-18'),
    events: [
      {
        appointmentDate: '2023-08-18',
        service: [
          { serviceName: 'HIV', count: 2 },
          { serviceName: 'Lab testing', count: 3 },
        ],
      },
    ],
  };

  it('renders properly when type is "daily"', () => {
    render(<DailyWorkloadView {...mockData} />);

    expect(screen.getByText('All Day')).toBeInTheDocument();
    expect(screen.getByText('HIV')).toBeInTheDocument();
    expect(screen.getByText('Lab testing')).toBeInTheDocument();
  });

  it('navigates when a service area is clicked', () => {
    render(<DailyWorkloadView {...mockData} />);

    fireEvent.click(screen.getByText('HIV'));

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
