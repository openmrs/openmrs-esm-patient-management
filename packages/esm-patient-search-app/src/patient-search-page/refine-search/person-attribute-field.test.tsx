import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonAttributeField, type PersonAttributeFieldProps } from './person-attribute-field.component';
import {
  useAttributeConceptAnswers,
  useConfiguredAnswerConcepts,
  useLocations,
  usePersonAttributeType,
} from './person-attributes.resource';
import {
  type AdvancedPatientSearchState,
  type LocationEntry,
  type PersonAttributeTypeResponse,
  type SearchFieldConfig,
} from '../../types';
import { useForm } from 'react-hook-form';

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: jest.fn().mockReturnValue({
    handleSubmit: jest.fn(),
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
    getValues: jest.fn((str) => (str === 'recurringPatternDaysOfWeek' ? [] : null)),
    setValue: jest.fn(),
    formState: { errors: {} },
    watch: jest.fn(),
  }),
  Controller: ({ render }) =>
    render({
      field: {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        name: 'test',
        ref: jest.fn(),
      },
      formState: {
        isSubmitted: false,
        errors: {},
      },
      fieldState: {
        isTouched: false,
        error: undefined,
      },
    }),
}));

jest.mock('./person-attributes.resource', () => ({
  usePersonAttributeType: jest.fn(),
  useAttributeConceptAnswers: jest.fn(),
  useConfiguredAnswerConcepts: jest.fn(),
  useLocations: jest.fn(),
}));

const mockUsePersonAttributeType = jest.mocked(usePersonAttributeType);
const mockUseAttributeConceptAnswers = jest.mocked(useAttributeConceptAnswers);
const mockUseConfiguredAnswerConcepts = jest.mocked(useConfiguredAnswerConcepts);
const mockUseLocations = jest.mocked(useLocations);

describe('PersonAttributeField', () => {
  const user = userEvent.setup();

  const defaultProps: PersonAttributeFieldProps = {
    field: {
      name: 'testAttribute',
      type: 'personAttribute',
      label: 'Test Attribute',
      attributeTypeUuid: 'test-uuid',
    } as SearchFieldConfig,
    inTabletOrOverlay: false,
    isTablet: false,
    control: useForm<AdvancedPatientSearchState>().control,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('String Attribute Type', () => {
    beforeEach(() => {
      mockUsePersonAttributeType.mockReturnValue({
        data: { format: 'java.lang.String', display: 'Test String Attribute' } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });
    });

    it('renders text input for string attribute type', () => {
      render(<PersonAttributeField {...defaultProps} />);
      expect(screen.getByLabelText('Test String Attribute')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Concept Attribute Type', () => {
    beforeEach(() => {
      mockUsePersonAttributeType.mockReturnValue({
        data: { format: 'org.openmrs.Concept', display: 'Test Concept Attribute' } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });

      mockUseConfiguredAnswerConcepts.mockReturnValue({
        configuredConceptAnswers: [],
        isLoadingConfiguredAnswers: false,
      });

      mockUseAttributeConceptAnswers.mockReturnValue({
        conceptAnswers: [
          { uuid: 'concept-answer-uuid-1', display: 'concept-answer-1' },
          { uuid: 'concept-answer-uuid-2', display: 'concept-answer-2' },
        ],
        isLoadingConceptAnswers: false,
        errorFetchingConceptAnswers: null,
      });
    });

    it('renders a combobox for concept attribute type', async () => {
      render(<PersonAttributeField {...defaultProps} />);
      const combobox = screen.getByRole('combobox');

      expect(combobox).toBeInTheDocument();
      expect(screen.getByText('Test Concept Attribute')).toBeInTheDocument();
      await user.click(combobox);
      expect(screen.getByText('concept-answer-1')).toBeInTheDocument();
      expect(screen.getByText('concept-answer-2')).toBeInTheDocument();
    });

    it('handles custom concept answers', async () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: {
          format: 'org.openmrs.Concept',
          display: 'Test Concept Attribute',
        } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });

      mockUseConfiguredAnswerConcepts.mockReturnValue({
        configuredConceptAnswers: [
          { uuid: 'concept-answer-1-uuid', display: 'concept-answer-1' },
          { uuid: 'concept-answer-2-uuid', display: 'concept-answer-2' },
        ],
        isLoadingConfiguredAnswers: false,
      });

      const propsWithCustomConcepts: PersonAttributeFieldProps = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          answerConceptSetUuid: 'test-concept-set-uuid',
          conceptAnswersUuids: ['concept-answer-1-uuid', 'concept-answer-2-uuid'],
        },
      };

      render(<PersonAttributeField {...propsWithCustomConcepts} />);
      const combobox = screen.getByRole('combobox');
      await user.click(combobox);
      expect(screen.getByText('concept-answer-1')).toBeInTheDocument();
      expect(screen.getByText('concept-answer-2')).toBeInTheDocument();
    });

    it('handles concept selection', async () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: {
          format: 'org.openmrs.Concept',
          display: 'Test Concept Attribute',
        } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });
      mockUseConfiguredAnswerConcepts.mockReturnValue({
        configuredConceptAnswers: [
          { uuid: 'concept-answer-1-uuid', display: 'concept-answer-1' },
          { uuid: 'concept-answer-2-uuid', display: 'concept-answer-2' },
        ],
        isLoadingConfiguredAnswers: false,
      });
      const propsWithAnswerConceptUuidAndCustomAnswers: PersonAttributeFieldProps = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          answerConceptSetUuid: 'test-concept-set-uuid',
          conceptAnswersUuids: ['concept-answer-1-uuid', 'concept-answer-2-uuid'],
        },
      };

      render(<PersonAttributeField {...propsWithAnswerConceptUuidAndCustomAnswers} />);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);
      expect(screen.getByText('concept-answer-1')).toBeInTheDocument();
      expect(screen.getByText('concept-answer-2')).toBeInTheDocument();
    });
  });

  describe('Location Attribute Type', () => {
    beforeEach(() => {
      mockUsePersonAttributeType.mockReturnValue({
        data: { format: 'org.openmrs.Location', display: 'Test Location Attribute' } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });
      mockUseLocations.mockReturnValue({
        locations: [
          { resource: { id: 'location-1-uuid', name: 'Location 1' } },
          { resource: { id: 'location-2-uuid', name: 'Location 2' } },
        ] as LocationEntry[],
        isLoading: false,
        loadingNewData: false,
        error: undefined,
      });
    });

    it('renders location combobox', () => {
      render(<PersonAttributeField {...defaultProps} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Test Location Attribute')).toBeInTheDocument();
    });

    it('handles location search input', async () => {
      render(<PersonAttributeField {...defaultProps} />);
      const combobox = screen.getByRole('combobox');
      await user.type(combobox, 'Loc');
      expect(mockUseLocations).toHaveBeenCalledWith(null, 'Loc');
    });
  });

  describe('Error Handling', () => {
    it('shows an error notification when loading attribute type fails', () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load attribute type'),
      });
      render(<PersonAttributeField {...defaultProps} />);
      expect(screen.getByText('Error loading attribute type test-uuid')).toBeInTheDocument();
    });
  });

  describe('Unsupported Attribute Format', () => {
    it('shows an error for unsupported formats', () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: { format: 'unsupported.format', display: 'Unsupported Attribute' } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });
      render(<PersonAttributeField {...defaultProps} />);
      expect(screen.getByText('Unsupported attribute format: unsupported.format')).toBeInTheDocument();
    });
  });
});
