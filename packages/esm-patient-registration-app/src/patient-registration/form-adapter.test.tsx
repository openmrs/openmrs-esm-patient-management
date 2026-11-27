import React, { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, type Resolver, useForm, useFormContext, type UseFormReturn } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Field, useField, useFormHelpers, useRevalidateOnChange } from './form-adapter';
import { createRegistrationResolver } from './registration-resolver';
import { getValidationSchema } from './validation/patient-registration-validation';
import type { RegistrationConfig } from '../config-schema';
import type { FormValues } from './patient-registration.types';
import type { PatternRule } from './validation/pattern-rules';

const config = {
  freeTextFieldConceptUuid: 'free-text-uuid',
  fieldConfigurations: {
    gender: [
      { label: 'M', value: 'male' },
      { label: 'F', value: 'female' },
    ],
    identifier: { allowPreferredSelection: false },
  },
} as unknown as RegistrationConfig;

const validValues = {
  additionalFamilyName: '',
  additionalGivenName: '',
  birthdate: new Date('1990-01-01'),
  birthdateEstimated: false,
  isDead: false,
  causeOfDeath: null,
  deathDate: null,
  email: 'john.doe@example.com',
  familyName: 'Doe',
  gender: 'male',
  givenName: 'John',
  identifiers: {},
} as unknown as FormValues;

const obsUuid = 'weight-uuid';

function createResolver(rules: Array<PatternRule> = []) {
  const schema = getValidationSchema(
    config,
    (_key: string, defaultValue: string) => defaultValue,
    () => rules,
  );
  return createRegistrationResolver(schema);
}

let form: UseFormReturn<FormValues>;

function TestForm({
  children,
  defaultValues = validValues,
  resolver = createResolver(),
}: {
  children?: React.ReactNode;
  defaultValues?: FormValues;
  resolver?: Resolver<FormValues>;
}) {
  form = useForm<FormValues>({ defaultValues, resolver });
  return (
    <FormProvider {...form}>
      <Revalidate />
      {children}
    </FormProvider>
  );
}

function Revalidate() {
  useRevalidateOnChange();
  return null;
}

function TextField({ name, type = 'text' }: { name: string; type?: string }) {
  const [field, meta] = useField(name);
  return (
    <>
      <input aria-label={name} type={type} {...field} value={field.value ?? ''} />
      <span data-testid={`${name}-value`}>{JSON.stringify(field.value)}</span>
      <span data-testid={`${name}-error`}>{meta.error ?? ''}</span>
      <span data-testid={`${name}-touched`}>{String(meta.touched)}</span>
    </>
  );
}

function ErrorProbe({ name }: { name: string }) {
  const [, meta] = useField(name);
  return <span data-testid={`${name}-error`}>{meta.error ?? ''}</span>;
}

describe('form adapter', () => {
  it('revalidates the whole form once per change', async () => {
    const resolve = createResolver();
    const counter = vi.fn(resolve);
    render(<TestForm resolver={counter} />);
    await waitFor(() => expect(form).toBeDefined());
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    const before = counter.mock.calls.length;

    act(() => form.setValue('givenName', 'a'));

    await waitFor(() => expect(counter.mock.calls.length).toBeGreaterThan(before));
    const after = counter.mock.calls.length;
    expect(after - before).toBeLessThanOrEqual(2);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(counter.mock.calls.length).toBe(after);
  });

  it('updates the error of a related field', async () => {
    render(
      <TestForm>
        <ErrorProbe name="deathCause" />
      </TestForm>,
    );
    expect(screen.getByTestId('deathCause-error')).toBeEmptyDOMElement();

    act(() => form.setValue('isDead', true));

    await waitFor(() => expect(form.formState.errors.deathCause?.message).toBe('Cause of death is required'));
    expect(screen.getByTestId('deathCause-error')).toHaveTextContent('Cause of death is required');
  });

  it('useField returns the value and updates it from an input event', async () => {
    const user = userEvent.setup();
    render(
      <TestForm>
        <TextField name="givenName" />
      </TestForm>,
    );
    expect(screen.getByLabelText('givenName')).toHaveValue('John');

    await user.clear(screen.getByLabelText('givenName'));
    await user.type(screen.getByLabelText('givenName'), 'Jane');

    expect(screen.getByLabelText('givenName')).toHaveValue('Jane');
    expect(form.getValues('givenName')).toBe('Jane');
  });

  it('useField parses number inputs as Formik does', async () => {
    const user = userEvent.setup();
    render(
      <TestForm>
        <TextField name="yearsEstimated" type="number" />
      </TestForm>,
    );

    await user.type(screen.getByLabelText('yearsEstimated'), '5');
    expect(form.getValues('yearsEstimated')).toBe(5);

    await user.clear(screen.getByLabelText('yearsEstimated'));
    expect(form.getValues('yearsEstimated')).toBe('');
  });

  it('useField marks the field touched on blur', async () => {
    const user = userEvent.setup();
    render(
      <TestForm>
        <TextField name="givenName" />
      </TestForm>,
    );
    expect(screen.getByTestId('givenName-touched')).toHaveTextContent('false');

    await user.click(screen.getByLabelText('givenName'));
    await user.tab();

    expect(screen.getByTestId('givenName-touched')).toHaveTextContent('true');
  });

  it("field.onBlur touches the blurred element's name, else its id, as Formik does", async () => {
    const user = userEvent.setup();
    function Probe() {
      const [field] = useField('givenName');
      const [, familyMeta] = useField('familyName');
      const [, givenMeta] = useField('givenName');
      return (
        <>
          <input aria-label="named" {...field} name="familyName" />
          <span data-testid="given">{String(givenMeta.touched)}</span>
          <span data-testid="family">{String(familyMeta.touched)}</span>
        </>
      );
    }
    render(
      <TestForm>
        <Probe />
      </TestForm>,
    );

    await user.click(screen.getByLabelText('named'));
    await user.tab();
    expect(screen.getByTestId('family')).toHaveTextContent('true');
    expect(screen.getByTestId('given')).toHaveTextContent('false');
  });

  it('field.onBlur touches the blurred id when the element has no name, and its own field with no event', async () => {
    const user = userEvent.setup();
    function Probe() {
      const [field] = useField('givenName');
      const [, givenMeta] = useField('givenName');
      const [, familyMeta] = useField('familyName');
      return (
        <>
          <span aria-label="unnamed" id="familyName" tabIndex={0} onBlur={field.onBlur} />
          <button onClick={() => field.onBlur()}>no event</button>
          <span data-testid="given">{String(givenMeta.touched)}</span>
          <span data-testid="family">{String(familyMeta.touched)}</span>
        </>
      );
    }
    render(
      <TestForm>
        <Probe />
      </TestForm>,
    );

    await user.click(screen.getByLabelText('unnamed'));
    await user.tab();
    await waitFor(() => expect(screen.getByTestId('family')).toHaveTextContent('true'));
    expect(screen.getByTestId('given')).toHaveTextContent('false');

    await user.click(screen.getByText('no event'));
    await waitFor(() => expect(screen.getByTestId('given')).toHaveTextContent('true'));
  });

  it('shows the error of an empty required field after blur without typing', async () => {
    const user = userEvent.setup();
    render(
      <TestForm defaultValues={{ ...validValues, givenName: '' }}>
        <TextField name="givenName" />
      </TestForm>,
    );
    expect(screen.getByTestId('givenName-error')).toBeEmptyDOMElement();

    await user.click(screen.getByLabelText('givenName'));
    await user.tab();

    await waitFor(() => expect(screen.getByTestId('givenName-error')).toHaveTextContent('Given name is required'));
    expect(screen.getByTestId('givenName-touched')).toHaveTextContent('true');
  });

  it('meta.error shows the message for a nested path', async () => {
    const user = userEvent.setup();
    const rule: PatternRule = {
      path: `obs.${obsUuid}`,
      pattern: '^\\d+$',
      message: 'Digits only',
      onInvalidPattern: 'pass',
    };
    render(
      <TestForm resolver={createResolver([rule])}>
        <TextField name={`obs.${obsUuid}`} />
        <ErrorProbe name="obs" />
      </TestForm>,
    );

    await user.type(screen.getByLabelText(`obs.${obsUuid}`), 'abc');

    await waitFor(() => expect(screen.getByTestId(`obs.${obsUuid}-error`)).toHaveTextContent('Digits only'));
    // An object node has no message of its own.
    expect(screen.getByTestId('obs-error')).toBeEmptyDOMElement();
  });

  it('setFieldTouched marks touched without changing the value', async () => {
    let helpers: ReturnType<typeof useFormHelpers>;
    function Helpers() {
      helpers = useFormHelpers();
      return null;
    }
    render(
      <TestForm>
        <Helpers />
        <TextField name="givenName" />
      </TestForm>,
    );

    act(() => helpers.setFieldTouched('givenName', true, false));

    await waitFor(() => expect(screen.getByTestId('givenName-touched')).toHaveTextContent('true'));
    expect(form.getValues('givenName')).toBe('John');
    expect(form.formState.dirtyFields.givenName).toBeFalsy();
  });

  it('does not validate when setFieldTouched is called with shouldValidate false', async () => {
    let helpers: ReturnType<typeof useFormHelpers>;
    function Helpers() {
      helpers = useFormHelpers();
      return null;
    }
    const counter = vi.fn(createResolver());
    render(
      <TestForm defaultValues={{ ...validValues, givenName: '' }} resolver={counter}>
        <Helpers />
        <TextField name="givenName" />
      </TestForm>,
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    const before = counter.mock.calls.length;

    act(() => helpers.setFieldTouched('givenName', true, false));

    await waitFor(() => expect(screen.getByTestId('givenName-touched')).toHaveTextContent('true'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(screen.getByTestId('givenName-error')).toBeEmptyDOMElement();
    expect(counter.mock.calls.length).toBe(before);

    // The next change without shouldValidate false validates again.
    act(() => helpers.setFieldTouched('familyName', true));
    await waitFor(() => expect(screen.getByTestId('givenName-error')).toHaveTextContent('Given name is required'));
  });

  it('does not validate when setFieldValue is called with shouldValidate false', async () => {
    let helpers: ReturnType<typeof useFormHelpers>;
    function Helpers() {
      helpers = useFormHelpers();
      return null;
    }
    const counter = vi.fn(createResolver());
    render(
      <TestForm resolver={counter}>
        <Helpers />
        <TextField name="givenName" />
      </TestForm>,
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    const before = counter.mock.calls.length;

    act(() => helpers.setFieldValue('givenName', '', false));

    expect(screen.getByLabelText('givenName')).toHaveValue('');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(screen.getByTestId('givenName-error')).toBeEmptyDOMElement();
    expect(counter.mock.calls.length).toBe(before);
  });

  it('useField helpers do not validate when shouldValidate is false', async () => {
    let fieldHelpers: ReturnType<typeof useField>[2];
    function Helpers() {
      [, , fieldHelpers] = useField('givenName');
      return null;
    }
    const counter = vi.fn(createResolver());
    render(
      <TestForm resolver={counter}>
        <Helpers />
        <TextField name="givenName" />
      </TestForm>,
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    const before = counter.mock.calls.length;

    act(() => {
      fieldHelpers.setValue('', false);
      fieldHelpers.setTouched(true, false);
    });

    await waitFor(() => expect(screen.getByTestId('givenName-touched')).toHaveTextContent('true'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(screen.getByTestId('givenName-error')).toBeEmptyDOMElement();
    expect(counter.mock.calls.length).toBe(before);
  });

  it('setFieldValue sets the value', async () => {
    let helpers: ReturnType<typeof useFormHelpers>;
    function Helpers() {
      helpers = useFormHelpers();
      return null;
    }
    render(
      <TestForm>
        <Helpers />
        <TextField name="givenName" />
      </TestForm>,
    );

    act(() => helpers.setFieldValue('givenName', 'Jane'));

    expect(screen.getByLabelText('givenName')).toHaveValue('Jane');
    expect(screen.getByTestId('givenName-touched')).toHaveTextContent('false');
  });

  it('returns the same functions on every render', async () => {
    const seen: Array<unknown> = [];
    function Probe() {
      const [field, , helpers] = useField('givenName');
      const { setFieldValue, setFieldTouched } = useFormHelpers();
      seen.push([field.onChange, field.onBlur, helpers.setValue, helpers.setTouched, setFieldValue, setFieldTouched]);
      return null;
    }
    render(
      <TestForm>
        <Probe />
      </TestForm>,
    );

    act(() => form.setValue('givenName', 'a'));
    await waitFor(() => expect(seen.length).toBeGreaterThan(1));

    const first = seen[0] as Array<unknown>;
    for (const functions of seen) {
      (functions as Array<unknown>).forEach((fn, index) => expect(fn).toBe(first[index]));
    }
  });

  it('Field passes field, form and meta to its children', async () => {
    const user = userEvent.setup();
    const rule: PatternRule = {
      path: `obs.${obsUuid}`,
      pattern: '^\\d+$',
      message: 'Digits only',
      onInvalidPattern: 'pass',
    };
    const children = vi.fn(({ field }) => <input aria-label="obs" {...field} value={field.value ?? ''} />);
    render(
      <TestForm resolver={createResolver([rule])}>
        <Field name={`obs.${obsUuid}`}>{children}</Field>
      </TestForm>,
    );

    await user.type(screen.getByLabelText('obs'), 'x');
    await user.tab();

    await waitFor(() => expect(children.mock.lastCall[0].meta.error).toBe('Digits only'));
    const { field, form: formProps, meta } = children.mock.lastCall[0];
    expect(field).toEqual({
      name: `obs.${obsUuid}`,
      value: 'x',
      onChange: expect.any(Function),
      onBlur: expect.any(Function),
    });
    expect(meta).toEqual({ value: 'x', error: 'Digits only', touched: true, initialValue: undefined });
    // As in Formik, errors and touched are nested objects, not keyed by the dotted path.
    expect(formProps.errors.obs[obsUuid]).toBe('Digits only');
    expect(formProps.errors[`obs.${obsUuid}`]).toBeUndefined();
    expect(formProps.touched.obs[obsUuid]).toBe(true);
    expect(formProps.values.givenName).toBe('John');
    expect(formProps.setFieldValue).toEqual(expect.any(Function));
    expect(formProps.setFieldTouched).toEqual(expect.any(Function));
  });
});
