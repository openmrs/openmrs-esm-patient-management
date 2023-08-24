import React from 'react';
import { render } from '@testing-library/react';

import RootComponent from './root.component';
window['getOpenmrsSpaBase'] = jest.fn().mockImplementation(() => '/');

describe('RootComponent', () => {
  it('renders without crashing', () => {
    render(<RootComponent />);
  });
});
