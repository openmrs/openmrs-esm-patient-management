import React from 'react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import { render, screen, waitFor } from '@testing-library/react';
import { type FieldDefinition } from '../../../config-schema';
import { usePersonAttributeType } from './person-attributes.resource';
import { useConceptAnswers } from '../field.resource';
import { PersonAttributeField } from './person-attribute-field.component';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';

jest.mock('./person-attributes.resource', () => ({
  ...jest.requireActual('./person-attributes.resource'),
  usePersonAttributeType: jest.fn(),
}));

jest.mock('../field.resource', () => ({
  ...jest.requireActual('../field.resource'),
  useConceptAnswers: jest.fn(),
}));

const mockUsePersonAttributeType = jest.mocked(usePersonAttributeType);
const mockUseConceptAnswers = jest.mocked(useConceptAnswers);

const mockPersonAttributeType = {
  format: 'java.lang.String',
  display: 'Referred by',
  uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
  name: 'Referred by',
  description: 'The person who referred the patient',
};

/**
 * Helper to render PersonAttributeField with Formik render props for state-dependent tests.
 */
const renderPersonAttributeFieldWithFormik = (
  fieldDefinition: FieldDefinition,
  initialValues: Partial<FormValues> = {},
  options?: { enableReinitialize?: boolean },
) => {
  const defaultValues = {
    attributes: {},
    ...initialValues,
  };

  let formValuesRef: FormValues = { ...initialFormValues, ...defaultValues } as FormValues;

  const utils = render(
    <Formik initialValues={defaultValues} onSubmit={() => {}} enableReinitialize={options?.enableReinitialize}>
      {({ setFieldValue, values, setFieldTouched }) => {
        formValuesRef = { ...initialFormValues, ...values } as FormValues;
        return (
          <Form>
            <PersonAttributeField fieldDefinition={fieldDefinition} />
          </Form>
        );
      }}
    </Formik>,
  );

  return {
    ...utils,
    getFormValues: () => formValuesRef,
  };
};

describe('PersonAttributeField', () => {
  beforeEach(() => {
    mockUsePersonAttributeType.mockReturnValue({
      data: mockPersonAttributeType,
      isLoading: false,
      error: null,
    });
  });

  describe('Loading and error states', () => {
    it('renders a skeleton if attribute type is loading', async () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const fieldDefinition: FieldDefinition = {
        id: 'referredBy',
        uuid: 'attribute-uuid',
        label: 'Attribute',
        showHeading: true,
        type: 'person attribute',
      };

      renderPersonAttributeFieldWithFormik(fieldDefinition);

      await screen.findByRole('heading', { name: /attribute/i });
      expect(screen.queryByLabelText(/referred by/i)).not.toBeInTheDocument();
    });

    it('renders an error notification if unable to fetch attribute type', () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch attribute type'),
      });

      const fieldDefinition: FieldDefinition = {
        id: 'referredBy',
        uuid: 'attribute-uuid',
        label: 'Attribute',
        showHeading: false,
        type: 'person attribute',
      };

      renderPersonAttributeFieldWithFormik(fieldDefinition);

      // Check for the specific error message text
      expect(screen.getByText(/Unable to fetch person attribute type/i)).toBeInTheDocument();
    });

    it('renders an error notification if attribute type has unknown format', () => {
      mockUsePersonAttributeType.mockReturnValue({
        data: { ...mockPersonAttributeType, format: 'unknown' },
        isLoading: false,
        error: null,
      });

      const fieldDefinition: FieldDefinition = {
        id: 'referredby',
        label: 'Referred by',
        type: 'person attribute',
        uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
        validation: {
          matches: '',
          required: true,
        },
        showHeading: true,
      };

      renderPersonAttributeFieldWithFormik(fieldDefinition);

      // Check for the specific error message text
      expect(screen.getByText(/Patient attribute type has unknown format/i)).toBeInTheDocument();
      expect(screen.getByText(/unknown/i)).toBeInTheDocument();
    });
  });

  describe('Heading display', () => {
    it('shows heading when showHeading is true', () => {
      const fieldDefinition: FieldDefinition = {
        id: 'referredby',
        label: 'Referred by',
        type: 'person attribute',
        uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
        validation: {
          matches: '',
          required: true,
        },
        showHeading: true,
      };

      renderPersonAttributeFieldWithFormik(fieldDefinition);

      expect(screen.getByRole('heading', { name: /referred by/i })).toBeInTheDocument();
    });

    it('does not show heading when showHeading is false', () => {
      const fieldDefinition: FieldDefinition = {
        id: 'referredby',
        label: 'Referred by',
        type: 'person attribute',
        uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
        validation: {
          matches: '',
          required: true,
        },
        showHeading: false,
      };

      renderPersonAttributeFieldWithFormik(fieldDefinition);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('String format (text input)', () => {
    const textFieldDefinition: FieldDefinition = {
      id: 'referredby',
      label: 'Referred by',
      type: 'person attribute',
      uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
      validation: {
        matches: '',
        required: false,
      },
      showHeading: true,
    };

    it('renders a text input field for String format', () => {
      renderPersonAttributeFieldWithFormik(textFieldDefinition);

      const input = screen.getByRole('textbox', { name: /referred by/i });
      expect(input).toBeInTheDocument();
    });

    it('allows user to enter text', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderPersonAttributeFieldWithFormik(textFieldDefinition);

      const input = screen.getByRole('textbox', { name: /referred by/i }) as HTMLInputElement;
      await user.type(input, 'Dr. Smith');

      await waitFor(() => {
        expect(getFormValues().attributes['4dd56a75-14ab-4148-8700-1f4f704dc5b0']).toBe('Dr. Smith');
      });
    });

    it('renders as required when configured', () => {
      renderPersonAttributeFieldWithFormik({
        ...textFieldDefinition,
        validation: {
          matches: '',
          required: true,
        },
      });

      const input = screen.getByRole('textbox', { name: /referred by/i });
      expect(input).toBeRequired();
    });

    it('renders as optional when not required', () => {
      renderPersonAttributeFieldWithFormik(textFieldDefinition);

      const input = screen.getByRole('textbox', { name: /referred by/i });
      expect(input).not.toBeRequired();
    });
  });

  describe('Concept format (coded select)', () => {
    const codedFieldDefinition: FieldDefinition = {
      id: 'referredby',
      label: 'Referred by',
      type: 'person attribute',
      uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
      answerConceptSetUuid: '6682d17f-0777-45e4-a39b-93f77eb3531c',
      validation: {
        matches: '',
        required: false,
      },
      showHeading: true,
    };

    beforeEach(() => {
      mockUsePersonAttributeType.mockReturnValue({
        data: { ...mockPersonAttributeType, format: 'org.openmrs.Concept' },
        isLoading: false,
        error: null,
      });

      mockUseConceptAnswers.mockReturnValue({
        data: [
          { uuid: '1', display: 'Option 1' },
          { uuid: '2', display: 'Option 2' },
        ],
        error: null,
        isLoading: false,
      });
    });

    it('renders a select field for Concept format', () => {
      renderPersonAttributeFieldWithFormik(codedFieldDefinition);

      const select = screen.getByRole('combobox', { name: /referred by/i });
      expect(select).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('allows user to select an option', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderPersonAttributeFieldWithFormik(codedFieldDefinition);

      const select = screen.getByRole('combobox', { name: /referred by/i }) as HTMLSelectElement;
      await user.selectOptions(select, '1');

      await waitFor(() => {
        expect(getFormValues().attributes['4dd56a75-14ab-4148-8700-1f4f704dc5b0']).toBe('1');
      });
      expect(select.value).toBe('1');
    });

    it('renders as required when configured', () => {
      renderPersonAttributeFieldWithFormik({
        ...codedFieldDefinition,
        validation: {
          matches: '',
          required: true,
        },
      });

      const select = screen.getByRole('combobox', { name: /referred by/i });
      expect(select).toBeRequired();
    });

    it('renders as optional when not required', () => {
      renderPersonAttributeFieldWithFormik(codedFieldDefinition);

      const select = screen.getByRole('combobox', { name: /referred by/i });
      expect(select).not.toBeRequired();
    });
  });
});
