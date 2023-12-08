import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useLayoutType, isDesktop } from '@openmrs/esm-framework';
import Overlay from './overlay.component';

const mockUseLayoutType = useLayoutType as jest.Mock;
const mockIsDesktop = isDesktop as jest.Mock;

jest.mock('@openmrs/esm-framework');

describe('Overlay', () => {
  it('renders the desktop version of the overlay', () => {
    mockUseLayoutType.mockImplementation(() => 'desktop');
    render(
      <Overlay close={() => {}} header="Test Header">
        Overlay content
      </Overlay>,
    );

    const headerContent = screen.getByText('Test Header');
    const closeButton = screen.getByRole('button', { name: 'Close overlay' });

    expect(headerContent).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
  });

  it('renders the tablet version of the overlay', () => {
    mockUseLayoutType.mockImplementation(() => 'tablet');
    mockIsDesktop.mockImplementation(() => false);
    render(
      <Overlay close={() => {}} header="Test Header">
        Overlay content
      </Overlay>,
    );

    const headerContent = screen.getByText('Test Header');
    const backButton = screen.getByRole('button', { name: 'Close overlay' });

    expect(headerContent).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
  });

  it('calls the close function when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockClose = jest.fn();

    mockUseLayoutType.mockImplementation(() => 'desktop');
    render(
      <Overlay close={mockClose} header="Test Header">
        Overlay content
      </Overlay>,
    );

    const closeButton = screen.getByRole('button', { name: 'Close overlay' });
    await user.click(closeButton);

    expect(mockClose).toHaveBeenCalled();
  });
});
