import React from 'react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import { render, screen, waitFor } from '@testing-library/react';
import { useConceptAnswers } from '../field.resource';
import { CodedPersonAttributeField } from './coded-person-attribute-field.component';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';

const mockUseConceptAnswers = jest.mocked(useConceptAnswers);

jest.mock('../field.resource', () => ({
  ...jest.requireActual('../field.resource'),
  useConceptAnswers: jest.fn(),
}));

const personAttributeType = {
  format: 'org.openmrs.Concept',
  display: 'Referred by',
  uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
  name: '',
  description: '',
};

const answerConceptSetUuid = '6682d17f-0777-45e4-a39b-93f77eb3531c';

/**
 * Helper to render CodedPersonAttributeField with Formik render props for state-dependent tests.
 */
const renderCodedPersonAttributeFieldWithFormik = (
  props: {
    answerConceptSetUuid?: string | null;
    customConceptAnswers?: Array<{ uuid: string; label?: string }>;
    required?: boolean;
  } = {},
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
            <CodedPersonAttributeField
              id="attributeId"
              personAttributeType={personAttributeType}
              answerConceptSetUuid={props.answerConceptSetUuid ?? answerConceptSetUuid}
              label={personAttributeType.display}
              customConceptAnswers={props.customConceptAnswers ?? []}
              required={props.required ?? false}
            />
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

describe('CodedPersonAttributeField', () => {
  const conceptAnswers = [
    { uuid: '1', display: 'Option 1' },
    { uuid: '2', display: 'Option 2' },
  ];

  beforeEach(() => {
    mockUseConceptAnswers.mockReturnValue({
      data: conceptAnswers,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('renders the conceptAnswers as select options', () => {
      renderCodedPersonAttributeFieldWithFormik();

      expect(screen.getByLabelText(/Referred by/i)).toBeInTheDocument();
      expect(screen.getByText(/Option 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Option 2/i)).toBeInTheDocument();
    });

    it('renders customConceptAnswers as select options when they are provided', () => {
      renderCodedPersonAttributeFieldWithFormik({
        customConceptAnswers: [
          {
            uuid: 'A',
            label: 'Special Option A',
          },
          {
            uuid: 'B',
            label: 'Special Option B',
          },
        ],
      });

      expect(screen.getByLabelText(/Referred by/i)).toBeInTheDocument();
      expect(screen.getByText(/Special Option A/i)).toBeInTheDocument();
      expect(screen.getByText(/Special Option B/i)).toBeInTheDocument();
      expect(screen.queryByText(/Option 1/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Option 2/i)).not.toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('allows user to select an option', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderCodedPersonAttributeFieldWithFormik();

      const select = screen.getByRole('combobox', { name: /Referred by/i }) as HTMLSelectElement;
      await user.selectOptions(select, '1');

      await waitFor(() => {
        expect(getFormValues().attributes[personAttributeType.uuid]).toBe('1');
      });
      expect(select.value).toBe('1');
    });

    it('allows user to switch between options', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderCodedPersonAttributeFieldWithFormik();

      const select = screen.getByRole('combobox', { name: /Referred by/i }) as HTMLSelectElement;

      // Select first option
      await user.selectOptions(select, '1');
      await waitFor(() => {
        expect(getFormValues().attributes[personAttributeType.uuid]).toBe('1');
      });

      // Switch to second option
      await user.selectOptions(select, '2');
      await waitFor(() => {
        expect(getFormValues().attributes[personAttributeType.uuid]).toBe('2');
      });
    });

    it('allows user to select custom concept answers', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderCodedPersonAttributeFieldWithFormik({
        customConceptAnswers: [
          {
            uuid: 'A',
            label: 'Special Option A',
          },
          {
            uuid: 'B',
            label: 'Special Option B',
          },
        ],
      });

      const select = screen.getByRole('combobox', { name: /Referred by/i }) as HTMLSelectElement;
      await user.selectOptions(select, 'A');

      await waitFor(() => {
        expect(getFormValues().attributes[personAttributeType.uuid]).toBe('A');
      });
    });
  });

  describe('Required field', () => {
    it('renders as required when required prop is true', () => {
      renderCodedPersonAttributeFieldWithFormik({ required: true });

      const select = screen.getByRole('combobox', { name: /Referred by/i });
      expect(select).toBeRequired();
    });

    it('renders as optional when required prop is false', () => {
      renderCodedPersonAttributeFieldWithFormik({ required: false });

      const select = screen.getByRole('combobox', { name: /Referred by/i });
      expect(select).not.toBeRequired();
    });
  });

  describe('Loading state', () => {
    it('does not render select while concept answers are loading', () => {
      mockUseConceptAnswers.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderCodedPersonAttributeFieldWithFormik();

      // Component returns null while loading, so select should not be in document
      expect(screen.queryByRole('combobox', { name: /Referred by/i })).not.toBeInTheDocument();
    });
  });
});
