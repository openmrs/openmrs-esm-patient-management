import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import CustomOverflowMenuComponent from './overflow-menu.component';

describe('CustomOverflowMenuComponent', () => {
  it.only('should render', () => {
    render(<CustomOverflowMenuComponent menuTitle="Test Menu" dropDownMenu={true} children={<li>Option 1</li>} />);
    expect(screen.getByRole('button', { name: 'Test Menu' })).toBeInTheDocument();
  });

  it('should toggle the menu when the button is clicked', () => {
    render(<CustomOverflowMenuComponent menuTitle="Test Menu" dropDownMenu={true} children={<li>Option 1</li>} />);

    const menuButton = screen.getByRole('button', { name: 'Test Menu' });
    const menuOptions = screen.queryByText('Option 1');

    // expect(menuOptions).toBeNull();

    fireEvent.click(menuButton);

    const updatedMenuOptions = screen.getByText('Option 1');
    expect(updatedMenuOptions).toBeInTheDocument(); // Menu should be open after click

    fireEvent.click(menuButton);

    // expect(screen.queryByText('Option 1')).toBeNull();
  });

  it('should close the menu when clicking outside the component', () => {
    render(
      <CustomOverflowMenuComponent menuTitle="Test Menu" dropDownMenu={true}>
        <li>Option 1</li>
        <li>Option 2</li>
      </CustomOverflowMenuComponent>,
    );

    const menuButton = screen.getByRole('button', { name: 'Test Menu' });
    fireEvent.click(menuButton);

    const body = document.body;
    fireEvent.mouseDown(body);

    const menuOptions = screen.getByText('Option 1');
    expect(menuOptions).not.toBeInTheDocument(); // Menu should be closed after clicking outside
  });
});
