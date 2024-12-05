import React from 'react';
import { render, screen } from '@testing-library/react';
import { SearchField } from './search-field.component';
import { usePersonAttributeType } from './person-attributes.resource';
import { type AdvancedPatientSearchState, type SearchFieldConfig } from '../../types';
import { useForm } from 'react-hook-form';
import { renderWithSwr } from 'tools';

jest.mock('./person-attributes.resource', () => ({
  usePersonAttributeType: jest.fn(),
}));

const mockUsePersonAttributeType = jest.mocked(usePersonAttributeType);

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: jest.fn().mockReturnValue({
    control: {
      register: jest.fn(),
      unregister: jest.fn(),
      getFieldState: jest.fn(),
      _names: {
        array: new Set(['test']),
        mount: new Set(['test']),
        unMount: new Set(['test']),
        watch: new Set(['test']),
        focus: 'test',
        watchAll: false,
      },
      _subjects: {
        watch: jest.fn(),
        array: jest.fn(),
        state: jest.fn(),
      },
      _getWatch: jest.fn(),
      _formValues: {},
      _defaultValues: {},
    },
    getValues: jest.fn(),
    setValue: jest.fn(),
    formState: { errors: {} },
  }),
  Controller: ({ render, name, control }) =>
    render({
      field: {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        name,
        ref: jest.fn(),
      },
      formState: { errors: {} },
      fieldState: { error: undefined },
    }),
}));
it;

describe('SearchField', () => {
  const defaultProps = {
    control: useForm<AdvancedPatientSearchState>().control,
    inTabletOrOverlay: false,
    isTablet: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Gender field', () => {
    const genderField: SearchFieldConfig = {
      name: 'gender',
      type: 'gender',
    };

    it('renders all gender options', () => {
      render(<SearchField field={genderField} {...defaultProps} />);

      expect(screen.getByText('Any')).toBeInTheDocument();
      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('Female')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('groups gender options into two content switchers', () => {
      render(<SearchField field={genderField} {...defaultProps} />);
      const switchers = screen.getAllByRole('tablist');
      expect(switchers).toHaveLength(2);
    });
  });

  describe('Date of Birth field', () => {
    const dobField: SearchFieldConfig = {
      name: 'dateOfBirth',
      type: 'dateOfBirth',
    };

    it('renders three number inputs for day, month, and year', () => {
      render(<SearchField field={dobField} {...defaultProps} />);

      expect(screen.getByLabelText('Day of Birth')).toBeInTheDocument();
      expect(screen.getByLabelText('Month of Birth')).toBeInTheDocument();
      expect(screen.getByLabelText('Year of Birth')).toBeInTheDocument();
    });

    it('applies correct validation constraints to date inputs', () => {
      render(<SearchField field={dobField} {...defaultProps} />);

      const dayInput = screen.getByLabelText('Day of Birth');
      const monthInput = screen.getByLabelText('Month of Birth');
      const yearInput = screen.getByLabelText('Year of Birth');

      expect(dayInput).toHaveAttribute('min', '1');
      expect(dayInput).toHaveAttribute('max', '31');
      expect(monthInput).toHaveAttribute('min', '1');
      expect(monthInput).toHaveAttribute('max', '12');
      expect(yearInput).toHaveAttribute('min', '1800');
      expect(yearInput).toHaveAttribute('max', new Date().getFullYear().toString());
    });
  });

  describe('Age field', () => {
    const ageField: SearchFieldConfig = {
      name: 'age',
      type: 'age',
      min: 0,
      max: 120,
    };

    it('renders number input with correct constraints', () => {
      render(<SearchField field={ageField} {...defaultProps} />);

      const ageInput = screen.getByLabelText('Age');
      expect(ageInput).toBeInTheDocument();
      expect(ageInput).toHaveAttribute('type', 'number');
      expect(ageInput).toHaveAttribute('min', '0');
      expect(ageInput).toHaveAttribute('max', '120');
    });
  });

  describe('Postcode field', () => {
    const postcodeField: SearchFieldConfig = {
      name: 'postcode',
      type: 'postcode',
      placeholder: 'Enter postcode',
    };

    it('renders text input with correct attributes', () => {
      render(<SearchField field={postcodeField} {...defaultProps} />);
      const input = screen.getByLabelText('Postcode');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('Person Attribute field', () => {
    const personAttributeField: SearchFieldConfig = {
      name: 'test-uuid',
      type: 'personAttribute',
      attributeTypeUuid: 'test-uuid',
    };

    beforeEach(() => {
      mockUsePersonAttributeType.mockReturnValue({
        data: {
          format: 'java.lang.String',
          display: 'Phone Number',
          uuid: 'test-uuid',
        },
        isLoading: false,
        error: null,
      });
    });

    it('renders person attribute field with correct props', () => {
      renderWithSwr(<SearchField field={personAttributeField} {...defaultProps} />);
      expect(screen.getByText('Phone Number')).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    const ageField: SearchFieldConfig = {
      name: 'age',
      type: 'age',
    };

    it('applies tablet styles when in tablet mode', () => {
      render(<SearchField field={ageField} {...defaultProps} isTablet={true} />);
      expect(screen.getByLabelText('Age')).toBeInTheDocument();
    });

    it('applies overlay styles when in overlay mode', () => {
      render(<SearchField field={ageField} {...defaultProps} inTabletOrOverlay={true} />);
      expect(screen.getByLabelText('Age')).toBeInTheDocument();
    });
  });
});
