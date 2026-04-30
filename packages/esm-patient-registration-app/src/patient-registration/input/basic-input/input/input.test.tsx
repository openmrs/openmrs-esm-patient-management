import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { Input } from './input.component';

/**
 * Helper to render Input component with Formik.
 */
function renderInput(
  props: {
    name?: string;
    labelText?: string;
    required?: boolean;
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

  return render(
    <Formik initialValues={{ text: '', ...initialValues }} onSubmit={() => {}}>
      <Form>
        <Input {...defaultProps} />
      </Form>
    </Formik>,
  );
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
      let formValues: Record<string, string> = {};

      render(
        <Formik initialValues={{ text: '' }} onSubmit={() => {}}>
          {({ values }) => {
            formValues = values as Record<string, string>;
            return (
              <Form>
                <Input id="text" name="text" labelText="Text" required />
              </Form>
            );
          }}
        </Formik>,
      );

      const input = screen.getByLabelText('Text') as HTMLInputElement;
      await user.type(input, 'typed value');

      await waitFor(() => {
        expect(formValues.text).toBe('typed value');
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
});
