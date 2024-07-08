import React from 'react';
import { render, screen } from '@testing-library/react';
import Root from './nav-link';

describe('Nav link component', () => {
  it('renders a link to the patient registration page', () => {
    render(<Root />);
    const linkElement = screen.getByText('Patient Registration');

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/openmrs/spa/patient-registration');
  });
});
