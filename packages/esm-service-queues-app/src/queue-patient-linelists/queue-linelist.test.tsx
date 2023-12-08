import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import QueueLinelist from './queue-linelist.component';

describe('QueueLinelist', () => {
  it('renders with filter content initially', () => {
    render(<QueueLinelist closePanel={jest.fn()} />);

    const filterContent = screen.getByText('Filters');
    expect(filterContent).toBeInTheDocument();
  });

  it('toggles between filter content and null', async () => {
    const user = userEvent.setup();

    render(<QueueLinelist closePanel={jest.fn()} />);

    const closeButton = screen.getByText('Close overlay');
    await user.click(closeButton);

    const filterContent = screen.queryByTestId('filter-content');
    expect(filterContent).not.toBeInTheDocument();
  });
});
