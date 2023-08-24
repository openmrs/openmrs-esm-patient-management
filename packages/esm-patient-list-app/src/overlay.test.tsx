import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Overlay from './overlay.component';
import { useLayoutType, isDesktop } from '@openmrs/esm-framework';

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

  it('calls the close function when close button is clicked', () => {
    const mockClose = jest.fn();
    mockUseLayoutType.mockImplementation(() => 'desktop');
    render(
      <Overlay close={mockClose} header="Test Header">
        Overlay content
      </Overlay>,
    );

    const closeButton = screen.getByRole('button', { name: 'Close overlay' });
    fireEvent.click(closeButton);

    expect(mockClose).toHaveBeenCalled();
  });
});
