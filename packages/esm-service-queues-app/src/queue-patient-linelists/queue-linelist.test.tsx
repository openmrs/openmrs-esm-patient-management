import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QueueLinelist from './queue-linelist.component';

describe('QueueLinelist', () => {
  it('renders with filter content initially', () => {
    render(<QueueLinelist closePanel={jest.fn()} />);

    const filterContent = screen.getByText('Filters');
    expect(filterContent).toBeInTheDocument();
  });

  it('toggles between filter content and null', () => {
    render(<QueueLinelist closePanel={jest.fn()} />);

    const closeButton = screen.getByText('Close overlay');
    fireEvent.click(closeButton);

    const filterContent = screen.queryByTestId('filter-content');
    expect(filterContent).not.toBeInTheDocument();
  });
});
