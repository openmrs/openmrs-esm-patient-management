import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import CustomOverflowMenuComponent from './overflow-menu.component';

describe('CustomOverflowMenuComponent', () => {
  it('should render', () => {
    render(<CustomOverflowMenuComponent menuTitle="Test Menu" dropDownMenu={true} children={<li>Option 1</li>} />);
    expect(screen.getByRole('button', { name: 'Test Menu' })).toBeInTheDocument();
  });

  it('should toggle menu on trigger button click', () => {
    render(
      <CustomOverflowMenuComponent menuTitle="Menu" dropDownMenu={false}>
        <li>Option 1</li>
        <li>Option 2</li>
      </CustomOverflowMenuComponent>,
    );

    const triggerButton = screen.getByRole('button', { name: /menu/i });

    fireEvent.click(triggerButton);
    expect(triggerButton.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(triggerButton);
    expect(triggerButton.getAttribute('aria-expanded')).toBe('false');
  });
});
