import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonAttributeField, type PersonAttributeFieldProps } from './person-attribute-field.component';
import { useAttributeConceptAnswers, useLocations, usePersonAttributeType } from './person-attributes.resource';
import { type LocationEntry, type PersonAttributeTypeResponse, type SearchFieldConfig } from '../../types';
import { initialState } from '../advanced-search-reducer';

const mockUsePersonAttributeType = jest.mocked(usePersonAttributeType);
const mockUseAttributeConceptAnswers = jest.mocked(useAttributeConceptAnswers);
const mockUseLocations = jest.mocked(useLocations);

jest.mock('./person-attributes.resource', () => ({
  usePersonAttributeType: jest.fn(),
  useAttributeConceptAnswers: jest.fn(),
  useLocations: jest.fn(),
}));

describe('PersonAttributeField', () => {
  const user = userEvent.setup();

  const mockOnInputChange = jest.fn(() => jest.fn());
  const defaultProps: PersonAttributeFieldProps = {
    field: {
      name: 'testAttribute',
      type: 'personAttribute',
      label: 'Test Attribute',
      attributeTypeUuid: 'test-uuid',
    } as SearchFieldConfig,
    formState: initialState,
    inTabletOrOverlay: false,
    isTablet: false,
    onInputChange: mockOnInputChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('String Attribute Type', () => {
    beforeEach(() => {
      mockUsePersonAttributeType.mockReturnValue({
        data: {
          format: 'java.lang.String',
          display: 'Test String Attribute',
        } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });
    });

    it('renders text input for string attribute type', () => {
      render(<PersonAttributeField {...defaultProps} />);

      expect(screen.getByLabelText('Test Attribute')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
      render(<PersonAttributeField {...defaultProps} />);

      await user.type(screen.getByRole('textbox'), 'test value');
      expect(mockOnInputChange).toHaveBeenCalledWith('testAttribute');
    });
  });

  describe('Concept Attribute Type', () => {
    beforeEach(() => {
      mockUsePersonAttributeType.mockReturnValue({
        data: {
          format: 'org.openmrs.Concept',
          display: 'Test Concept Attribute',
        } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });

      mockUseAttributeConceptAnswers.mockReturnValue({
        data: [
          { uuid: 'concept1', display: 'Concept 1' },
          { uuid: 'concept2', display: 'Concept 2' },
        ],
        isLoading: false,
        error: null,
      });
    });

    it('renders combobox for concept attribute type', async () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: {
          format: 'org.openmrs.Concept',
          display: 'Test Concept Attribute',
        } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });
      mockUseAttributeConceptAnswers.mockReturnValue({
        data: [
          { uuid: 'concept-answer-1-uuid', display: 'concept-answer-1' },
          { uuid: 'concept-answer-2-uuid', display: 'concept-answer-2' },
        ],
        isLoading: false,
        error: null,
      });
      const propsWithAnswerConceptSetUuid: PersonAttributeFieldProps = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          answerConceptSetUuid: 'test-concept-set-uuid',
        },
      };

      render(<PersonAttributeField {...propsWithAnswerConceptSetUuid} />);

      const combobox = screen.getByRole('combobox');

      expect(combobox).toBeInTheDocument();
      expect(screen.getByText('Test Attribute')).toBeInTheDocument();
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
      const propsWithCustomConcepts: PersonAttributeFieldProps = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          answerConceptSetUuid: 'test-concept-set-uuid',
          customConceptAnswers: [
            { uuid: 'concept-answer-1-uuid', label: 'concept-answer-1' },
            { uuid: 'concept-answer-2-uuid', label: 'concept-answer-2' },
          ],
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
      const propsWithAnswerConceptUuidAndCustomAnswers: PersonAttributeFieldProps = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          answerConceptSetUuid: 'test-concept-set-uuid',
          customConceptAnswers: [
            { uuid: 'concept-answer-1-uuid', label: 'concept-answer-1' },
            { uuid: 'concept-answer-2-uuid', label: 'concept-answer-2' },
          ],
        },
      };

      render(<PersonAttributeField {...propsWithAnswerConceptUuidAndCustomAnswers} />);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);
      await user.click(screen.getByText('concept-answer-1'));

      expect(mockOnInputChange).toHaveBeenCalled();
    });
  });

  describe('Location Attribute Type', () => {
    beforeEach(() => {
      mockUsePersonAttributeType.mockReturnValue({
        data: {
          format: 'org.openmrs.Location',
          display: 'Test Location Attribute',
        } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });

      mockUseLocations.mockReturnValue({
        locations: [
          { resource: { id: 'location-1-uuid', name: 'Location 1' } },
          {
            resource: {
              id: 'location-2-uuid',
              name: 'Location 2',
            },
          },
        ] as LocationEntry[],
        isLoading: false,
        loadingNewData: false,
      });
    });

    it('renders location combo box', () => {
      render(<PersonAttributeField {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Test Attribute')).toBeInTheDocument();
    });

    it('handles location search', async () => {
      render(<PersonAttributeField {...defaultProps} />);

      const combobox = screen.getByRole('combobox');
      await user.type(combobox, 'test');

      expect(useLocations).toHaveBeenCalledWith(null, 'test');
    });

    it('handles location selection', async () => {
      render(<PersonAttributeField {...defaultProps} />);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);
      await user.click(screen.getByText('Location 1'));

      expect(mockOnInputChange).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('shows error notification when attribute type loading fails', () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load attribute type'),
      });

      render(<PersonAttributeField {...defaultProps} />);

      expect(screen.getByText('Error loading attribute type')).toBeInTheDocument();
    });

    it('shows error for unsupported attribute format', () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: {
          format: 'unsupported.format',
          display: 'Unsupported Attribute',
        } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });

      render(<PersonAttributeField {...defaultProps} />);

      expect(screen.getByText('Unsupported attribute format: unsupported.format')).toBeInTheDocument();
    });
  });

  describe('Form State Integration', () => {
    it('displays existing attribute values', () => {
      const propsWithValue = {
        ...defaultProps,
        formState: {
          ...initialState,
          attributes: {
            testAttribute: 'existing value',
          },
        },
      };

      mockUsePersonAttributeType.mockReturnValue({
        data: {
          format: 'java.lang.String',
          display: 'Test String Attribute',
        } as PersonAttributeTypeResponse,
        isLoading: false,
        error: null,
      });

      render(<PersonAttributeField {...propsWithValue} />);

      expect(screen.getByDisplayValue('existing value')).toBeInTheDocument();
    });
  });
});
