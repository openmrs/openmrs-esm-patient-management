import React from 'react';
import { vi, describe, it, expect, test } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext } from 'react-hook-form';
import { getDefaultsFromConfigSchema } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../../../../config-schema';
import { renderWithRegistrationForm } from '../../../../test-utils/render-with-registration-form';
import { initialFormValues } from '../../../patient-registration.component';
import { useFormHelpers } from '../../../form-adapter';
import { Input } from './input.component';
import type { FormValues } from '../../../patient-registration.types';

/** Resets the form to `values` on click, as the edit-mode reinitialize and the dummy data do. */
const ResetButton: React.FC<{ values: Record<string, unknown> }> = ({ values }) => {
  const { reset } = useFormContext<FormValues>();
  return (
    <button type="button" onClick={() => reset(values as unknown as FormValues)}>
      Reset
    </button>
  );
};

/** Sets `name` to `value` on click through the form helpers. */
const SetValueButton: React.FC<{ name: string; value: unknown }> = ({ name, value }) => {
  const { setFieldValue } = useFormHelpers();
  return (
    <button type="button" onClick={() => setFieldValue(name, value)}>
      Set value
    </button>
  );
};

/**
 * Helper to render Input component in a registration form.
 */
function renderInput(
  props: {
    name?: string;
    labelText?: string;
    required?: boolean;
    hideOptionalLabel?: boolean;
    checkWarning?: (value: string) => string | undefined;
    placeholder?: string;
  } = {},
  initialValues: Record<string, string> = {},
) {
  const defaultProps = {
    id: 'text',
    name: 'text',
    labelText: 'Text',
    placeholder: 'Enter text',
    required: false,
    ...props,
  };

  return renderWithRegistrationForm(<Input {...defaultProps} />, {
    initialValues: { text: '', ...initialValues } as Partial<FormValues>,
  });
}

describe('Input component', () => {
  describe('Rendering', () => {
    it('renders the input field', () => {
      renderInput();

      const input = screen.getByLabelText('Text (optional)') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('text');
    });

    it('shows required label when field is required', () => {
      renderInput({ required: true });

      expect(screen.getByLabelText('Text')).toBeInTheDocument();
      expect(screen.queryByLabelText('Text (optional)')).not.toBeInTheDocument();
    });

    it('shows optional label when field is not required', () => {
      renderInput({ required: false });

      expect(screen.getByLabelText('Text (optional)')).toBeInTheDocument();
    });

    it('omits the optional label when hideOptionalLabel is set', () => {
      renderInput({ required: false, hideOptionalLabel: true });

      const input = screen.getByLabelText('Text');
      expect(input).not.toBeRequired();
      expect(screen.queryByLabelText('Text (optional)')).not.toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('allows user to type and updates the input value', async () => {
      const user = userEvent.setup();
      renderInput({ required: true });

      const input = screen.getByLabelText('Text') as HTMLInputElement;
      await user.type(input, 'test value');

      expect(input.value).toBe('test value');
    });

    it('updates form values when user types', async () => {
      const user = userEvent.setup();
      const { getValues } = renderWithRegistrationForm(<Input id="text" name="text" labelText="Text" required />, {
        initialValues: { text: '' } as Partial<FormValues>,
      });
      const formValues = () => getValues() as unknown as Record<string, string>;

      const input = screen.getByLabelText('Text') as HTMLInputElement;
      await user.type(input, 'typed value');

      await waitFor(() => {
        expect(formValues().text).toBe('typed value');
      });
    });
  });

  describe('Warning validation', () => {
    it('shows warning when checkWarning returns a warning message', async () => {
      const user = userEvent.setup();
      renderInput({
        required: true,
        checkWarning: (value) => {
          if (value.length > 5) {
            return 'name should be of 5 char';
          }
        },
      });

      const input = screen.getByLabelText('Text') as HTMLInputElement;
      await user.type(input, 'Hello World');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('name should be of 5 char')).toBeInTheDocument();
      });
    });

    it('does not show warning when input is valid', async () => {
      const user = userEvent.setup();
      renderInput({
        required: true,
        checkWarning: (value) => {
          if (value.length > 5) {
            return 'name should be of 5 char';
          }
        },
      });

      const input = screen.getByLabelText('Text') as HTMLInputElement;
      await user.type(input, 'text');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('name should be of 5 char')).not.toBeInTheDocument();
      });
    });

    it('clears warning when user corrects input', async () => {
      const user = userEvent.setup();
      renderInput({
        required: true,
        checkWarning: (value) => {
          if (value.length > 5) {
            return 'name should be of 5 char';
          }
        },
      });

      const input = screen.getByLabelText('Text') as HTMLInputElement;

      // Type invalid value
      await user.type(input, 'Hello World');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('name should be of 5 char')).toBeInTheDocument();
      });

      // Clear and type valid value
      await user.clear(input);
      await user.type(input, 'text');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('name should be of 5 char')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form state', () => {
    it('shows the schema error after a blur without typing', async () => {
      const user = userEvent.setup();
      renderWithRegistrationForm(<Input id="givenName" name="givenName" labelText="First name" required />, {
        initialValues: { ...initialFormValues, givenName: '' },
        withValidation: true,
        config: getDefaultsFromConfigSchema(esmPatientRegistrationSchema) as RegistrationConfig,
      });

      expect(screen.queryByText('Given name is required')).not.toBeInTheDocument();

      await user.click(screen.getByLabelText('First name'));
      await user.tab();

      expect(await screen.findByText('Given name is required')).toBeInTheDocument();
      expect(screen.getByLabelText('First name')).toHaveAttribute('aria-invalid', 'true');
    });

    it('stores a number from a number input, and an empty string once cleared', async () => {
      const user = userEvent.setup();
      const { getValues } = renderWithRegistrationForm(
        <Input id="weight" name="weight" labelText="Weight" type="number" required />,
        { initialValues: { weight: '' } as unknown as Partial<FormValues> },
      );
      const formValues = () => getValues() as unknown as Record<string, unknown>;
      const input = screen.getByLabelText('Weight');

      await user.type(input, '5');
      expect(formValues().weight).toBe(5);

      await user.clear(input);
      expect(formValues().weight).toBe('');
    });

    it('stores typed text after the form is reset', async () => {
      const user = userEvent.setup();
      const { getValues } = renderWithRegistrationForm(
        <>
          <Input id="text" name="text" labelText="Text" required />
          <ResetButton values={{ text: 'reset value' }} />
        </>,
        { initialValues: { text: '' } as Partial<FormValues> },
      );
      const formValues = () => getValues() as unknown as Record<string, string>;

      await user.click(screen.getByRole('button', { name: 'Reset' }));
      const input = screen.getByLabelText('Text') as HTMLInputElement;
      await waitFor(() => expect(input.value).toBe('reset value'));

      await user.clear(input);
      await user.type(input, 'typed');

      expect(input.value).toBe('typed');
      expect(formValues().text).toBe('typed');
    });

    it('shows an empty input after a reset to values without the field', async () => {
      const user = userEvent.setup();
      const { getValues } = renderWithRegistrationForm(
        <>
          <Input id="text" name="text" labelText="Text" required />
          <ResetButton values={{ other: 'other value' }} />
        </>,
        { initialValues: { text: 'first value' } as Partial<FormValues> },
      );
      const input = screen.getByLabelText('Text') as HTMLInputElement;
      expect(input.value).toBe('first value');

      await user.click(screen.getByRole('button', { name: 'Reset' }));

      await waitFor(() => expect(input.value).toBe(''));
      expect((getValues() as unknown as Record<string, unknown>).text).toBeUndefined();
    });

    it('shows an empty input when the value is set to undefined', async () => {
      const user = userEvent.setup();
      renderWithRegistrationForm(
        <>
          <Input id="text" name="text" labelText="Text" required />
          <SetValueButton name="text" value={undefined} />
        </>,
        { initialValues: { text: 'first value' } as Partial<FormValues> },
      );
      const input = screen.getByLabelText('Text') as HTMLInputElement;

      await user.click(screen.getByRole('button', { name: 'Set value' }));

      await waitFor(() => expect(input.value).toBe(''));
    });

    it('shows a value written to the parent object of the field', async () => {
      const user = userEvent.setup();
      renderWithRegistrationForm(
        <>
          <Input id="parent.child" name="parent.child" labelText="Child" required />
          <SetValueButton name="parent" value={{ child: 'new value' }} />
        </>,
        { initialValues: { parent: { child: '' } } as unknown as Partial<FormValues> },
      );
      const input = screen.getByLabelText('Child') as HTMLInputElement;

      await user.click(screen.getByRole('button', { name: 'Set value' }));

      await waitFor(() => expect(input.value).toBe('new value'));
    });

    it('marks the field touched on blur', async () => {
      const user = userEvent.setup();
      const { getTouched } = renderInput({ required: true });

      await user.click(screen.getByLabelText('Text'));
      expect(getTouched().text).toBeUndefined();

      await user.tab();
      expect(getTouched().text).toBe(true);
    });

    it('marks the name of the blurred element touched, as Formik', () => {
      const { getTouched } = renderInput({ required: true });

      // fireEvent sets the input's DOM name to `otherField` before the blur, since Input always renders its own name.
      fireEvent.blur(screen.getByLabelText('Text'), { target: { name: 'otherField' } });

      expect(getTouched().otherField).toBe(true);
      expect(getTouched().text).toBeUndefined();
    });
  });
});
