import React from 'react';
import { render, screen } from '@testing-library/react';
import SideMenu from './side-menu.component';

jest.mock('@openmrs/esm-framework', () => ({
  LeftNavMenu: () => <div data-testid="left-nav-menu">Mocked LeftNavMenu</div>,
}));
jest.mock('@openmrs/esm-framework');

describe('SideMenu', () => {
  it('renders the LeftNavMenu', () => {
    render(<SideMenu />);

    const leftNavMenu = screen.getByTestId('left-nav-menu');
    expect(leftNavMenu).toBeInTheDocument();
  });
});
