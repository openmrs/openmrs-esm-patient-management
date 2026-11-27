import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { reportError } from '@openmrs/esm-framework';
import { useConceptAnswers } from '../field.resource';
import { CodedPersonAttributeField } from './coded-person-attribute-field.component';
import { Input } from '../../input/basic-input/input/input.component';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import type { RegistrationConfig } from '../../../config-schema';
import type { FormValues } from '../../patient-registration.types';

const mockUseConceptAnswers = vi.mocked(useConceptAnswers);

vi.mock('../field.resource', async () => ({
  ...((await vi.importActual('../field.resource')) as object),
  useConceptAnswers: vi.fn(),
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
 * Helper to render CodedPersonAttributeField in a registration form for state-dependent tests.
 */
const renderCodedPersonAttributeFieldInForm = (
  props: {
    answerConceptSetUuid?: string | null;
    customConceptAnswers?: Array<{ uuid: string; label?: string }>;
    required?: boolean;
  } = {},
  initialValues: Partial<FormValues> = {},
) => {
  const defaultValues = {
    attributes: {},
    ...initialValues,
  };

  return renderWithRegistrationForm(
    <CodedPersonAttributeField
      id="attributeId"
      personAttributeType={personAttributeType}
      answerConceptSetUuid={props.answerConceptSetUuid ?? answerConceptSetUuid}
      label={personAttributeType.display}
      customConceptAnswers={props.customConceptAnswers ?? []}
      required={props.required ?? false}
    />,
    { initialValues: defaultValues },
  );
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
      renderCodedPersonAttributeFieldInForm();

      expect(screen.getByLabelText(/Referred by/i)).toBeInTheDocument();
      expect(screen.getByText(/Option 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Option 2/i)).toBeInTheDocument();
    });

    it('renders customConceptAnswers as select options when they are provided', () => {
      renderCodedPersonAttributeFieldInForm({
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

  describe('Form binding', () => {
    it('names the select after the form path of the attribute', () => {
      renderCodedPersonAttributeFieldInForm();

      expect(screen.getByRole('combobox', { name: /Referred by/i })).toHaveAttribute(
        'name',
        `attributes.${personAttributeType.uuid}`,
      );
    });

    it('selects the initial value', () => {
      renderCodedPersonAttributeFieldInForm({}, { attributes: { [personAttributeType.uuid]: '2' } });

      expect((screen.getByRole('combobox', { name: /Referred by/i }) as HTMLSelectElement).value).toBe('2');
    });

    it('stores an empty string when "Select an option" is chosen', async () => {
      const user = userEvent.setup();
      const { getValues } = renderCodedPersonAttributeFieldInForm(
        {},
        { attributes: { [personAttributeType.uuid]: '1' } },
      );

      await user.selectOptions(screen.getByRole('combobox', { name: /Referred by/i }), 'Select an option');

      await waitFor(() => expect(getValues().attributes[personAttributeType.uuid]).toBe(''));
    });

    it('touches the attribute path on blur', async () => {
      const user = userEvent.setup();
      const { getTouched } = renderCodedPersonAttributeFieldInForm();

      await user.click(screen.getByRole('combobox', { name: /Referred by/i }));
      await user.tab();

      await waitFor(() => expect(getTouched()).toEqual({ attributes: { [personAttributeType.uuid]: true } }));
    });
  });

  describe('Misconfiguration', () => {
    beforeEach(() => {
      vi.mocked(reportError).mockImplementation(() => {});
    });

    it('renders nothing when there are no answers and no answer concept set', async () => {
      mockUseConceptAnswers.mockReturnValue({ data: null, isLoading: false, error: null });

      renderCodedPersonAttributeFieldInForm({ answerConceptSetUuid: '' });

      await waitFor(() => expect(screen.queryByRole('combobox')).not.toBeInTheDocument());
      expect(reportError).toHaveBeenCalled();
    });

    it('renders nothing when the answer concept set has no answers', async () => {
      mockUseConceptAnswers.mockReturnValue({ data: [], isLoading: false, error: null });

      renderCodedPersonAttributeFieldInForm();

      await waitFor(() => expect(screen.queryByRole('combobox')).not.toBeInTheDocument());
    });
  });

  it('does not load the answers again when another field changes', async () => {
    const user = userEvent.setup();
    renderWithRegistrationForm(
      <>
        <Input id="givenName" name="givenName" labelText="Given name" />
        <CodedPersonAttributeField
          id="attributeId"
          personAttributeType={personAttributeType}
          answerConceptSetUuid={answerConceptSetUuid}
          label={personAttributeType.display}
          customConceptAnswers={[]}
          required={false}
        />
      </>,
      {
        initialValues: { givenName: '', attributes: {} } as Partial<FormValues>,
        withValidation: true,
        config: {
          freeTextFieldConceptUuid: 'free-text-uuid',
          fieldConfigurations: {
            gender: [{ label: 'M', value: 'male' }],
            identifier: { allowPreferredSelection: false },
          },
        } as unknown as RegistrationConfig,
      },
    );
    await screen.findByRole('combobox', { name: /Referred by/i });
    const callsBefore = mockUseConceptAnswers.mock.calls.length;

    await user.type(screen.getByRole('textbox', { name: /Given name/i }), 'abc');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The answers hook shows a snackbar on every render while its request fails
    expect(mockUseConceptAnswers.mock.calls.length).toBe(callsBefore);
  });

  describe('User interaction', () => {
    it('allows user to select an option', async () => {
      const user = userEvent.setup();
      const { getValues } = renderCodedPersonAttributeFieldInForm();

      const select = screen.getByRole('combobox', { name: /Referred by/i }) as HTMLSelectElement;
      await user.selectOptions(select, '1');

      await waitFor(() => {
        expect(getValues().attributes[personAttributeType.uuid]).toBe('1');
      });
      expect(select.value).toBe('1');
    });

    it('allows user to switch between options', async () => {
      const user = userEvent.setup();
      const { getValues } = renderCodedPersonAttributeFieldInForm();

      const select = screen.getByRole('combobox', { name: /Referred by/i }) as HTMLSelectElement;

      // Select first option
      await user.selectOptions(select, '1');
      await waitFor(() => {
        expect(getValues().attributes[personAttributeType.uuid]).toBe('1');
      });

      // Switch to second option
      await user.selectOptions(select, '2');
      await waitFor(() => {
        expect(getValues().attributes[personAttributeType.uuid]).toBe('2');
      });
    });

    it('allows user to select custom concept answers', async () => {
      const user = userEvent.setup();
      const { getValues } = renderCodedPersonAttributeFieldInForm({
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
        expect(getValues().attributes[personAttributeType.uuid]).toBe('A');
      });
    });
  });

  describe('Required field', () => {
    it('renders as required when required prop is true', () => {
      renderCodedPersonAttributeFieldInForm({ required: true });

      const select = screen.getByRole('combobox', { name: /Referred by/i });
      expect(select).toBeRequired();
    });

    it('renders as optional when required prop is false', () => {
      renderCodedPersonAttributeFieldInForm({ required: false });

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

      renderCodedPersonAttributeFieldInForm();

      // Component returns null while loading, so select should not be in document
      expect(screen.queryByRole('combobox', { name: /Referred by/i })).not.toBeInTheDocument();
    });
  });
});
