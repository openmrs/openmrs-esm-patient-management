import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccessibleModal from './accessible-modal.component';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';

// Mock Carbon's ComposedModal
jest.mock('@carbon/react', () => ({
  ...jest.requireActual('@carbon/react'),
  ComposedModal: ({ open, onClose, children, ...props }: any) =>
    open ? (
      <div data-testid="composed-modal" {...props}>
        {children}
      </div>
    ) : null,
}));

describe('AccessibleModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders modal content when open', () => {
    render(
      <AccessibleModal isOpen={true} onClose={mockOnClose}>
        <ModalHeader>Test Modal</ModalHeader>
        <ModalBody>Test Content</ModalBody>
      </AccessibleModal>,
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <AccessibleModal isOpen={false} onClose={mockOnClose}>
        <ModalHeader>Test Modal</ModalHeader>
      </AccessibleModal>,
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('passes ARIA attributes correctly', () => {
    render(
      <AccessibleModal
        isOpen={true}
        onClose={mockOnClose}
        modalHeadingId="test-heading"
        modalDescriptionId="test-description">
        <ModalHeader>Test Modal</ModalHeader>
      </AccessibleModal>,
    );

    const modal = screen.getByTestId('composed-modal');
    expect(modal).toHaveAttribute('aria-labelledby', 'test-heading');
    expect(modal).toHaveAttribute('aria-describedby', 'test-description');
  });

  it('passes selectorPrimaryFocus to ComposedModal', () => {
    render(
      <AccessibleModal isOpen={true} onClose={mockOnClose} selectorPrimaryFocus="#primary-button">
        <ModalBody>Content</ModalBody>
      </AccessibleModal>,
    );

    const modal = screen.getByTestId('composed-modal');
    expect(modal).toHaveAttribute('selectorPrimaryFocus', '#primary-button');
  });

  it('stores and restores focus to triggering element', () => {
    const triggerButton = document.createElement('button');
    triggerButton.id = 'trigger-button';
    document.body.appendChild(triggerButton);
    triggerButton.focus();

    const { rerender } = render(
      <AccessibleModal isOpen={true} onClose={mockOnClose}>
        <ModalBody>Content</ModalBody>
      </AccessibleModal>,
    );

    expect(triggerButton).toHaveFocus();

    rerender(
      <AccessibleModal isOpen={false} onClose={mockOnClose}>
        <ModalBody>Content</ModalBody>
      </AccessibleModal>,
    );

    setTimeout(() => {
      expect(triggerButton).toHaveFocus();
    }, 10);

    document.body.removeChild(triggerButton);
  });
});
