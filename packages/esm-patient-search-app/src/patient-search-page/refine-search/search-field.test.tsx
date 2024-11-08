import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from './search-field.component';
import { type SearchFieldConfig } from '../../types';
import { usePersonAttributeType } from './person-attributes.resource';
import { initialState } from '../advanced-search-reducer';

const mockUsePersonAttributeType = jest.mocked(usePersonAttributeType);

jest.mock('./person-attributes.resource', () => ({
  usePersonAttributeType: jest.fn(),
}));

describe('SearchField', () => {
  const user = userEvent.setup();
  const mockOnInputChange = jest.fn(() => jest.fn());
  const mockOnDateOfBirthChange = jest.fn(() => jest.fn());
  mockUsePersonAttributeType.mockReturnValue({
    isLoading: false,
    error: null,
    data: {
      format: 'java.lang.String',
      uuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
      display: 'Telephone Number',
    },
  });

  const defaultProps = {
    formState: initialState,
    inTabletOrOverlay: false,
    isTablet: false,
    onInputChange: mockOnInputChange,
    onDateOfBirthChange: mockOnDateOfBirthChange,
  };

  describe('Gender field', () => {
    const genderField: SearchFieldConfig = {
      name: 'gender',
      type: 'gender',
      label: 'Sex',
    };

    it('renders gender switches with correct options', () => {
      render(<SearchField field={genderField} {...defaultProps} />);

      // Check all gender options are present
      expect(screen.getByRole('tab', { name: /any/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Male' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /female/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /other/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /unknown/i })).toBeInTheDocument();
    });

    it('handles gender selection correctly', async () => {
      render(<SearchField field={genderField} {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: 'Male' }));
      expect(mockOnInputChange).toHaveBeenCalledWith('gender');
    });
  });

  describe('Date of Birth field', () => {
    const dobField: SearchFieldConfig = {
      name: 'dateOfBirth',
      type: 'dateOfBirth',
      label: 'Date of Birth',
    };

    it('renders date of birth inputs with correct labels', () => {
      render(<SearchField field={dobField} {...defaultProps} />);

      expect(screen.getByLabelText(/day of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/month of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/year of birth/i)).toBeInTheDocument();
    });

    it('applies correct validation constraints', () => {
      render(<SearchField field={dobField} {...defaultProps} />);

      const dayInput = screen.getByLabelText(/day of birth/i);
      const monthInput = screen.getByLabelText(/month of birth/i);
      const yearInput = screen.getByLabelText(/year of birth/i);

      expect(dayInput).toHaveAttribute('min', '1');
      expect(dayInput).toHaveAttribute('max', '31');
      expect(monthInput).toHaveAttribute('min', '1');
      expect(monthInput).toHaveAttribute('max', '12');
      expect(yearInput).toHaveAttribute('min', '1800');
      expect(yearInput).toHaveAttribute('max', new Date().getFullYear().toString());
    });

    it('handles date input changes correctly', async () => {
      render(<SearchField field={dobField} {...defaultProps} />);

      await user.type(screen.getByLabelText(/day of birth/i), '15');
      expect(mockOnDateOfBirthChange).toHaveBeenCalledWith('date');

      await user.type(screen.getByLabelText(/month of birth/i), '06');
      expect(mockOnDateOfBirthChange).toHaveBeenCalledWith('month');

      await user.type(screen.getByLabelText(/year of birth/i), '1990');
      expect(mockOnDateOfBirthChange).toHaveBeenCalledWith('year');
    });
  });

  describe('Age field', () => {
    const ageField: SearchFieldConfig = {
      name: 'age',
      type: 'age',
      label: 'Age',
      min: 0,
      max: 120,
    };

    it('renders age input with correct attributes', () => {
      render(<SearchField field={ageField} {...defaultProps} />);

      const ageInput = screen.getByLabelText(/age/i);
      expect(ageInput).toBeInTheDocument();
      expect(ageInput).toHaveAttribute('min', '0');
      expect(ageInput).toHaveAttribute('max', '120');
      expect(ageInput).toHaveAttribute('type', 'number');
    });

    it('handles age input changes', async () => {
      render(<SearchField field={ageField} {...defaultProps} />);

      await user.type(screen.getByLabelText(/age/i), '25');
      expect(mockOnInputChange).toHaveBeenCalledWith('age');
    });
  });

  describe('Postcode field', () => {
    const postcodeField: SearchFieldConfig = {
      name: 'postcode',
      type: 'postcode',
      label: 'Postcode',
    };

    it('renders postcode input correctly', () => {
      render(<SearchField field={postcodeField} {...defaultProps} />);

      expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    });

    it('handles postcode input changes', async () => {
      render(<SearchField field={postcodeField} {...defaultProps} />);

      await user.type(screen.getByLabelText(/postcode/i), '12345');
      expect(mockOnInputChange).toHaveBeenCalledWith('postcode');
    });
  });

  describe('Person Attribute field', () => {
    const personAttributeField: SearchFieldConfig = {
      name: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
      type: 'personAttribute',
      label: 'Phone Number',
      attributeTypeUuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
    };

    it('renders person attribute field component', () => {
      render(<SearchField field={personAttributeField} {...defaultProps} />);

      expect(screen.getByText('Phone Number')).toBeInTheDocument();
    });
  });
});
