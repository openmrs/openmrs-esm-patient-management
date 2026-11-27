import React, { useMemo, useRef } from 'react';
import { vi } from 'vitest';
import { render, type RenderResult } from '@testing-library/react';
import { FormProvider, useForm, useFormContext, useFormState, type UseFormReturn } from 'react-hook-form';
import { useConfig } from '@openmrs/esm-framework';
import { useFormHelpers, useRevalidateOnChange, useStableFormValues } from '../patient-registration/form-adapter';
import {
  PatientRegistrationContextProvider,
  type PatientRegistrationContextProps,
} from '../patient-registration/patient-registration-context';
import { createRegistrationResolver } from '../patient-registration/registration-resolver';
import { getValidationSchema } from '../patient-registration/validation/patient-registration-validation';
import {
  createPatternRuleRegistry,
  PatternRulesProvider,
  type PatternRuleRegistry,
} from '../patient-registration/validation/pattern-rules';
import type { RegistrationConfig } from '../config-schema';
import type { FormValues } from '../patient-registration/patient-registration.types';

export interface RenderWithRegistrationFormOptions {
  initialValues?: Partial<FormValues>;
  /** Replaces entries of the registration context. By default the context reads and writes the form. */
  contextValues?: Partial<PatientRegistrationContextProps>;
  /** Validates with the registration schema, as the registration form does. */
  withValidation?: boolean;
  /** The config for the schema. Defaults to `useConfig()`. */
  config?: RegistrationConfig;
  /** Called when the form is submitted and valid. */
  onSubmit?: (values: FormValues) => void;
}

export type RenderWithRegistrationFormResult = RenderResult & {
  getValues(): FormValues;
  /** Nested like the form values, with `true` at each touched leaf. */
  getTouched(): Record<string, any>;
};

const translate = (_key: string, defaultValue: string) => defaultValue;

/**
 * Renders `ui` inside a React Hook Form form wired as the registration form: whole-form revalidation on each change,
 * the pattern rules registry, and a registration context whose `values`, `setFieldValue` and `setFieldTouched` use
 * the form.
 */
export function renderWithRegistrationForm(
  ui: React.ReactElement,
  options: RenderWithRegistrationFormOptions = {},
): RenderWithRegistrationFormResult {
  const formRef: { current?: UseFormReturn<FormValues> } = {};
  const touchedRef: { current: Record<string, any> } = { current: {} };

  const utils = render(
    <TestForm options={options} formRef={formRef} touchedRef={touchedRef}>
      {ui}
    </TestForm>,
  );

  return {
    ...utils,
    getValues: () => formRef.current.getValues(),
    getTouched: () => touchedRef.current,
  };
}

const TestForm: React.FC<{
  options: RenderWithRegistrationFormOptions;
  formRef: { current?: UseFormReturn<FormValues> };
  touchedRef: { current: Record<string, any> };
  children: React.ReactNode;
}> = ({ options, formRef, touchedRef, children }) => {
  const patternRules = useRef(createPatternRuleRegistry()).current;
  const defaultConfig = useConfig<RegistrationConfig>();
  const config = options.config ?? defaultConfig;
  const resolver = useMemo(
    () =>
      options.withValidation
        ? createRegistrationResolver(getValidationSchema(config, translate, patternRules.getRules))
        : undefined,
    [options.withValidation, config, patternRules],
  );

  const form = useForm<FormValues>({
    defaultValues: options.initialValues as FormValues,
    resolver,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: false,
  });
  formRef.current = form;

  return (
    <FormProvider {...form}>
      <TestFormContent options={options} patternRules={patternRules} touchedRef={touchedRef}>
        {children}
      </TestFormContent>
    </FormProvider>
  );
};

const TestFormContent: React.FC<{
  options: RenderWithRegistrationFormOptions;
  patternRules: PatternRuleRegistry;
  touchedRef: { current: Record<string, any> };
  children: React.ReactNode;
}> = ({ options, patternRules, touchedRef, children }) => {
  useRevalidateOnChange();
  const { setFieldValue, setFieldTouched } = useFormHelpers();
  const values = useStableFormValues();
  const { handleSubmit, control } = useFormContext<FormValues>();
  touchedRef.current = useFormState({ control }).touchedFields;
  const setCapturePhotoProps = useRef(vi.fn()).current;

  const contextValue: PatientRegistrationContextProps = {
    identifierTypes: [],
    inEditMode: false,
    currentPhoto: '',
    setCapturePhotoProps,
    initialFormValues: (options.initialValues ?? {}) as FormValues,
    values,
    setFieldValue,
    setFieldTouched,
    ...options.contextValues,
  };

  return (
    // Unlike the registration form, this submit does not mark every field touched first.
    <form onSubmit={handleSubmit(options.onSubmit ?? (() => {}))}>
      <PatientRegistrationContextProvider value={contextValue}>
        <PatternRulesProvider registry={patternRules}>{children}</PatternRulesProvider>
      </PatientRegistrationContextProvider>
    </form>
  );
};
