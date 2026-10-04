import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionWrapper } from './section-wrapper.component';

vi.mock('./section.component', () => ({ Section: () => <div data-testid="section-fields" /> }));

const consent =
  'I told the patient the following about the use of their health information:\nTheir personal health information will go into a computer program.';

describe('SectionWrapper', () => {
  it('shows the section description above its fields', () => {
    render(
      <SectionWrapper
        index={3}
        sectionDefinition={{ id: 'rhd-registration', name: 'RHD Registration', description: consent, fields: [] }}
      />,
    );

    const description = screen.getByText(/I told the patient the following/);
    expect(description).toHaveTextContent('Their personal health information will go into a computer program.');
    expect(description.compareDocumentPosition(screen.getByTestId('section-fields'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('shows no description for a section without one', () => {
    render(<SectionWrapper index={0} sectionDefinition={{ id: 'demographics', name: 'Basic Info', fields: [] }} />);

    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });
});
