import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useLayoutType, isDesktop } from '@openmrs/esm-framework';
import Overlay from './overlay.component';

const mockUseLayoutType = jest.mocked(useLayoutType);
const mockIsDesktop = jest.mocked(isDesktop);
const mockClose = jest.fn();

describe('Overlay', () => {
  it('renders the desktop version of the overlay', () => {
    mockUseLayoutType.mockReturnValue('small-desktop');

    render(
      <Overlay close={mockClose} header="Test Header">
        Overlay content
      </Overlay>,
    );

    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close overlay' })).toBeInTheDocument();
  });

  it('renders the tablet version of the overlay', () => {
    mockUseLayoutType.mockReturnValue('tablet');
    mockIsDesktop.mockReturnValue(false);

    render(
      <Overlay close={mockClose} header="Test Header">
        Overlay content
      </Overlay>,
    );

    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close overlay' })).toBeInTheDocument();
  });

  it('calls the close function when close button is clicked', async () => {
    const user = userEvent.setup();
    mockUseLayoutType.mockReturnValue('small-desktop');

    render(
      <Overlay close={mockClose} header="Test Header">
        Overlay content
      </Overlay>,
    );

    await user.click(screen.getByRole('button', { name: 'Close overlay' }));
    expect(mockClose).toHaveBeenCalled();
  });
});
