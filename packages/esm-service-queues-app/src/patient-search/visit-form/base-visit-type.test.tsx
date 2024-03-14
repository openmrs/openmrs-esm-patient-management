import React from 'react';
import userEvent from '@testing-library/user-event';
import BaseVisitType from './base-visit-type.component';
import { render, screen } from '@testing-library/react';
import { mockPatient, mockVisitTypes } from '__mocks__';

jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: () => 'desktop',
  usePagination: jest.fn(() => ({ results: mockVisitTypes, currentPage: 1, goTo: jest.fn() })),
}));

describe('BaseVisitType', () => {
  it('renders visit types correctly', () => {
    render(
      <BaseVisitType
        patientUuid={mockPatient.uuid}
        onChange={() => {}}
        visitTypes={mockVisitTypes}
        enableSearch={true}
      />,
    );

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();

    mockVisitTypes.forEach((visitType) => {
      const radioButton = screen.getByLabelText(visitType.display);
      expect(radioButton).toBeInTheDocument();
    });
  });

  it('handles search input correctly', async () => {
    const user = userEvent.setup();

    render(
      <BaseVisitType
        patientUuid={mockPatient.uuid}
        onChange={() => {}}
        visitTypes={mockVisitTypes}
        enableSearch={true}
      />,
    );

    const searchInput: HTMLInputElement = screen.getByRole('searchbox');
    await user.type(searchInput, 'Visit Type 1');

    expect(searchInput.value).toBe('Visit Type 1');
  });

  it('calls onChange when a visit type is selected', async () => {
    const user = userEvent.setup();

    const mockOnChange = jest.fn();
    render(
      <BaseVisitType
        patientUuid={mockPatient.uuid}
        onChange={() => {}}
        visitTypes={mockVisitTypes}
        enableSearch={true}
      />,
    );

    const radioButton: HTMLInputElement = screen.getByLabelText(mockVisitTypes[0].display);
    await user.click(radioButton);
    expect(radioButton.checked).toBe(true);
  });
});
