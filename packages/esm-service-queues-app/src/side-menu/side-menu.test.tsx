import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SideMenu from './side-menu.component';

vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  LeftNavMenu: () => <div data-testid="left-nav-menu">Mocked LeftNavMenu</div>,
}));

describe('SideMenu', () => {
  it('renders the LeftNavMenu', () => {
    render(<SideMenu />);

    const leftNavMenu = screen.getByTestId('left-nav-menu');
    expect(leftNavMenu).toBeInTheDocument();
  });
});
