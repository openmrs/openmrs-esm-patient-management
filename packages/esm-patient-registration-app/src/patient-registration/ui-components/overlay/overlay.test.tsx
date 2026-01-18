import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useLayoutType, isDesktop } from '@openmrs/esm-framework';
import Overlay from './overlay.component';

const mockUseLayoutType = jest.mocked(useLayoutType);
const mockIsDesktop = jest.mocked(isDesktop);
/**
 * Helper to render Overlay component.
 */
function renderOverlay(
  close = jest.fn(),
  header = 'Test Header',
  buttonsGroup?: React.ReactElement,
  children?: React.ReactNode,
) {
  return render(<Overlay close={close} header={header} buttonsGroup={buttonsGroup} children={children} />);
}

describe('Overlay component', () => {
  const mockClose = jest.fn();

  beforeEach(() => {
    mockIsDesktop.mockReturnValue(true);
    mockUseLayoutType.mockReturnValue('desktop' as any);
  });

  describe('Desktop layout', () => {
    it('renders header text', () => {
      renderOverlay(mockClose, 'Test Header');

      expect(screen.getByText('Test Header')).toBeInTheDocument();
    });

    it('renders close button with icon', () => {
      renderOverlay(mockClose, 'Test Header');

      const closeButton = screen.getByRole('button', { name: /close overlay/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('calls close when close button is clicked', async () => {
      const user = userEvent.setup();
      renderOverlay(mockClose, 'Test Header');

      const closeButton = screen.getByRole('button', { name: /close overlay/i });
      await user.click(closeButton);

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('renders children content', () => {
      renderOverlay(mockClose, 'Test Header', undefined, <div>Test Content</div>);

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders buttonsGroup when provided', () => {
      const buttonsGroup = (
        <div>
          <button>Save</button>
          <button>Cancel</button>
        </div>
      );
      renderOverlay(mockClose, 'Test Header', buttonsGroup);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Tablet layout', () => {
    beforeEach(() => {
      mockIsDesktop.mockReturnValue(false);
      mockUseLayoutType.mockReturnValue('tablet' as any);
    });

    it('renders header with back arrow button', () => {
      renderOverlay(mockClose, 'Test Header');

      const backButton = screen.getByRole('button', { name: /close overlay/i });
      expect(backButton).toBeInTheDocument();
      expect(screen.getByText('Test Header')).toBeInTheDocument();
    });

    it('calls close when back button is clicked', async () => {
      const user = userEvent.setup();
      renderOverlay(mockClose, 'Test Header');

      const backButton = screen.getByRole('button', { name: /close overlay/i });
      await user.click(backButton);

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('renders children content in tablet layout', () => {
      renderOverlay(mockClose, 'Test Header', undefined, <div>Tablet Content</div>);

      expect(screen.getByText('Tablet Content')).toBeInTheDocument();
    });
  });
});
