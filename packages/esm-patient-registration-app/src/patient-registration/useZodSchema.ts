import { getGlobalStore } from '@openmrs/esm-framework';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import type { FormValues } from './patient-registration.types';
import { useTranslation } from 'react-i18next';

export function getZodSchemaStore() {
  return getGlobalStore<z.ZodSchema<Partial<FormValues>>>(
    'patient-registration-zod-schema',
    z.object({
      firstName: z.string({
        required_error: 'First name is required',
      }),
      yearsEstimated: z
        .number({
          invalid_type_error: 'Years estimated must be a number',
        })
        .min(0)
        .max(140, {
          message: 'Max error',
        }),
    }),
  );
}

export function addFieldSchemaToZod(fieldName: string, schema: z.ZodSchema) {
  const zodSchemaStore = getZodSchemaStore();
  zodSchemaStore.setState((prev) => ({
    ...prev,
    [fieldName]: schema,
  }));
}

type T = keyof FormValues;

export default function useZodSchema() {
  const { t } = useTranslation();
  const [zodSchema, setZodSchema] = useState<z.ZodSchema>(getZodSchemaStore().getState());
  const updateZodSchema = useCallback((key: T, value: z.ZodSchema) => {
    getZodSchemaStore().setState({
      [key]: value,
    });
  }, []);
  useEffect(() => {
    const unsubscribe = getZodSchemaStore().subscribe(setZodSchema);
    return () => {
      unsubscribe();
    };
  }, [setZodSchema]);
  const results = useMemo(
    () => ({
      zodSchema,
      updateZodSchema,
    }),
    [zodSchema, updateZodSchema],
  );
  return results;
}
