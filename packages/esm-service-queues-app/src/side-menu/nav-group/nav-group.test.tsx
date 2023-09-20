import React from 'react';
import { render, screen } from '@testing-library/react';
import NavGroupExtension from './nav-group.component';
import { registerNavGroup } from './nav-group';

jest.mock('./nav-group', () => ({
  registerNavGroup: jest.fn(),
}));

describe('NavGroupExtension', () => {
  const props = {
    title: 'Test Group',
    slotName: 'testSlot',
    renderIcon: () => <div>Test Icon</div>,
  };

  it('registers the navigation group on mount', () => {
    render(<NavGroupExtension {...props} />);

    expect(registerNavGroup).toHaveBeenCalledWith(props.slotName);
  });

  it('renders navigation group with provided icon and title', () => {
    render(<NavGroupExtension {...props} />);

    const icon = screen.getByText('Test Icon');
    expect(icon).toBeInTheDocument();

    const title = screen.getByText(props.title);
    expect(title).toBeInTheDocument();
  });
});
