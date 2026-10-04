import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionWrapper } from './section-wrapper.component';

vi.mock('./section.component', () => ({
  Section: () => <div data-testid="section-fields" />,
}));

describe('SectionWrapper', () => {
  it('renders the section description above the section fields', () => {
    render(
      <SectionWrapper
        index={0}
        sectionDefinition={{
          id: 'consent',
          name: 'Consent',
          description: 'Read the consent statement to the patient before recording consent.',
          fields: [],
        }}
      />,
    );

    const description = screen.getByText('Read the consent statement to the patient before recording consent.');
    expect(description.compareDocumentPosition(screen.getByTestId('section-fields'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('does not render a description when the section has none', () => {
    render(<SectionWrapper index={0} sectionDefinition={{ id: 'consent', name: 'Consent', fields: [] }} />);

    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });
});
