import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { get, isPlainObject } from 'lodash-es';
import { type Control, type FieldPath, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { type FormValues } from './patient-registration.types';
import { keepUnchangedObjects } from './form-values-utils';

/**
 * A Formik-shaped API over React Hook Form, so the field components only change the module they import from.
 * The fields are not registered with React Hook Form: values are read with `useWatch`, written with `setValue`,
 * and `useRevalidateOnChange` validates the whole form after every change, as Formik's validateOnChange and
 * validateOnBlur did.
 *
 * It also holds the helpers that fields reading React Hook Form directly use: `useRegistrationField` (field state
 * with Formik's change and blur handlers), `useFormHelpers` and `useRevalidateOnChange`. The Formik-shaped parts
 * (`useField`, `Field` and `useFormikContext`) go when no field uses them.
 */

export interface FieldInputProps<V = any> {
  name: string;
  value: V;
  onChange(eventOrValue: unknown): void;
  onBlur(event?: unknown): void;
}

export interface FieldMetaProps<V = any> {
  value: V;
  error?: string;
  touched: boolean;
  initialValue?: V;
}

export interface FieldHelperProps<V = any> {
  setValue(value: V, shouldValidate?: boolean): void;
  setTouched(touched: boolean, shouldValidate?: boolean): void;
}

export interface FormHelpers {
  setFieldValue(name: string, value: unknown, shouldValidate?: boolean): void;
  setFieldTouched(name: string, touched?: boolean, shouldValidate?: boolean): void;
}

export interface FieldFormProps extends FormHelpers {
  values: FormValues;
  /** Nested like the form values, with the error message at each leaf (as Formik's `errors`). */
  errors: Record<string, any>;
  /** Nested like the form values, with `true` at each touched leaf (as Formik's `touched`). */
  touched: Record<string, any>;
}

/**
 * The forms whose current write must not revalidate. A form helper called with `shouldValidate === false` sets this
 * around its `setValue` call; React Hook Form calls `watch` callbacks synchronously inside `setValue`, so
 * `useRevalidateOnChange` sees it.
 */
const skipRevalidation = new WeakSet<Control<FormValues>>();

/**
 * Validates the whole form after each change of a value or of touched state. `pause` and `resume` let a caller
 * make many changes and then validate once.
 */
export function useRevalidateOnChange(): { pause(): void; resume(): void } {
  const { watch, trigger, control } = useFormContext<FormValues>();
  const paused = useRef(false);

  useEffect(() => {
    // Only events with a name: `trigger()` emits form state without a name, so this does not loop.
    const sub = watch((_, info) => {
      if (info.name && !paused.current && !skipRevalidation.has(control)) {
        trigger();
      }
    });
    return () => sub.unsubscribe();
  }, [watch, trigger, control]);

  return useMemo(
    () => ({
      pause: () => {
        paused.current = true;
      },
      resume: () => {
        paused.current = false;
      },
    }),
    [],
  );
}

export function useFormHelpers(): FormHelpers {
  const { setValue, getValues, control } = useFormContext<FormValues>();

  return useMemo(() => {
    // As in Formik, `shouldValidate === false` skips validation and keeps the current errors. Any other value lets
    // useRevalidateOnChange validate the whole form.
    const write = (shouldValidate: boolean | undefined, update: () => void) => {
      if (shouldValidate !== false) {
        update();
        return;
      }
      skipRevalidation.add(control);
      try {
        update();
      } finally {
        skipRevalidation.delete(control);
      }
    };

    return {
      setFieldValue: (name, value, shouldValidate) =>
        write(shouldValidate, () => setValue(name as FieldPath<FormValues>, value as never, { shouldDirty: true })),
      setFieldTouched: (name, touched = true, shouldValidate) => {
        // React Hook Form cannot clear touched state with setValue. No field clears it.
        if (touched) {
          const path = name as FieldPath<FormValues>;
          write(shouldValidate, () => setValue(path, getValues(path), { shouldTouch: true }));
        }
      },
    };
  }, [setValue, getValues, control]);
}

/**
 * The whole form values. `useWatch` gives new copies of every object on each change, and sometimes React Hook Form's
 * own objects. As Formik, this gives the same object for each part of the values that did not change.
 */
export function useStableFormValues(): FormValues {
  const { control } = useFormContext<FormValues>();
  const watchedValues = useWatch({ control }) as FormValues;
  const sharedValues = useRef<FormValues>(undefined);
  sharedValues.current = keepUnchangedObjects(sharedValues.current, watchedValues);
  return sharedValues.current;
}

export function useFormikContext(): { values: FormValues } & FormHelpers {
  const values = useStableFormValues();
  const helpers = useFormHelpers();
  return { values, ...helpers };
}

/** Formik's change and blur handlers for the field `name`: `handleChange` stores the event's value, `handleBlur` touches the blurred element. */
export function useFieldHandlers(name: string): Pick<FieldInputProps, 'onChange' | 'onBlur'> {
  const { setFieldValue, setFieldTouched } = useFormHelpers();
  const onChange = useCallback(
    (eventOrValue: unknown) => setFieldValue(name, getChangeValue(eventOrValue)),
    [name, setFieldValue],
  );
  const onBlur = useCallback(
    (event?: unknown) => {
      const touchedName = getBlurName(event, name);
      if (touchedName) {
        setFieldTouched(touchedName, true);
      }
    },
    [name, setFieldTouched],
  );

  return useMemo(() => ({ onChange, onBlur }), [onChange, onBlur]);
}

/**
 * The state of the field `name` read from React Hook Form, with Formik's change and blur handlers. The field is not
 * registered: a registered field shows its value from mount once its value becomes undefined, and writes that value
 * back into the form after a reset.
 */
export function useRegistrationField<V = any>(
  name: string,
): { field: FieldInputProps<V>; error?: string; touched: boolean } {
  const path = name as FieldPath<FormValues>;
  const value = useWatch<FormValues>({ name: path }) as V;
  const { errors, touchedFields } = useFormState<FormValues>({ name: path });
  const handlers = useFieldHandlers(name);

  return {
    field: { name, value, ...handlers },
    error: getMessage(get(errors, name)),
    touched: !!get(touchedFields, name),
  };
}

export function useField<V = any>(name: string): [FieldInputProps<V>, FieldMetaProps<V>, FieldHelperProps<V>] {
  const { control } = useFormContext<FormValues>();
  const path = name as FieldPath<FormValues>;
  const value = useWatch({ control, name: path }) as V;
  const { errors, touchedFields, defaultValues } = useFormState({ control, name: path });
  const { setFieldValue, setFieldTouched } = useFormHelpers();
  const { onChange, onBlur } = useFieldHandlers(name);
  const helpers = useMemo<FieldHelperProps<V>>(
    () => ({
      setValue: (newValue, shouldValidate) => setFieldValue(name, newValue, shouldValidate),
      setTouched: (touched, shouldValidate) => setFieldTouched(name, touched, shouldValidate),
    }),
    [name, setFieldValue, setFieldTouched],
  );

  return [
    { name, value, onChange, onBlur },
    {
      value,
      error: getMessage(get(errors, name)),
      touched: !!get(touchedFields, name),
      initialValue: get(defaultValues, name),
    },
    helpers,
  ];
}

export const Field: React.FC<{
  name: string;
  children?: (props: { field: FieldInputProps; form: FieldFormProps; meta: FieldMetaProps }) => React.ReactNode;
}> = ({ name, children }) => {
  const [field, meta] = useField(name);
  const { control } = useFormContext<FormValues>();
  const values = useStableFormValues();
  const { errors, touchedFields } = useFormState({ control });
  const { setFieldValue, setFieldTouched } = useFormHelpers();

  const form: FieldFormProps = {
    values,
    errors: toMessages(errors) ?? {},
    touched: touchedFields,
    setFieldValue,
    setFieldTouched,
  };

  return <>{children?.({ field, form, meta })}</>;
};

/** The value Formik's `handleChange` takes from an event, or the value itself when it is not an event. */
export function getChangeValue(eventOrValue: unknown): unknown {
  const target = (eventOrValue as { target?: HTMLInputElement })?.target;
  if (!target || typeof eventOrValue !== 'object') {
    return eventOrValue;
  }

  const { type, value, checked } = target;
  if (/number|range/.test(type)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? '' : parsed;
  }
  if (/checkbox/.test(type)) {
    return checked;
  }
  return value;
}

/** The name Formik's `handleBlur` touches: the blurred element's name, else its id. Without an event, the field itself. */
export function getBlurName(event: unknown, fieldName: string): string | undefined {
  const target = (event as { target?: { name?: string; id?: string } } | undefined)?.target;
  return target ? target.name || target.id : fieldName;
}

/** The message of a React Hook Form error. An object node, which holds the errors of its children, has none. */
export function getMessage(error: unknown): string | undefined {
  const message = (error as { message?: unknown })?.message;
  return typeof message === 'string' ? message : undefined;
}

/** Turns React Hook Form errors into Formik errors: the same nesting, with the message at each leaf. */
function toMessages(errors: unknown): any {
  const message = getMessage(errors);
  if (message !== undefined) {
    return message;
  }
  if (Array.isArray(errors)) {
    return errors.map(toMessages);
  }
  if (isPlainObject(errors)) {
    return Object.fromEntries(Object.entries(errors as object).map(([key, value]) => [key, toMessages(value)]));
  }
  return undefined;
}
