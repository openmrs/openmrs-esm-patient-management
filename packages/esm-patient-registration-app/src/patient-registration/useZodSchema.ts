import { getGlobalStore } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';
import { z } from 'zod';

export function getZodSchemaStore() {
  return getGlobalStore<z.ZodSchema>('patient-registration-zod-schema', z.object({ firstName: z.string() }));
}

export function addFieldSchemaToZod(fieldName: string, schema: z.ZodSchema) {
  const zodSchemaStore = getZodSchemaStore();
  zodSchemaStore.setState((prev) => ({
    ...prev,
    [fieldName]: schema,
  }));
}

export default function useZodSchema() {
  const [zodSchema, setZodSchema] = useState<z.ZodSchema>(getZodSchemaStore().getState());
  useEffect(() => {
    const unsubscribe = getZodSchemaStore().subscribe(setZodSchema);
    return () => {
      unsubscribe();
    };
  }, [setZodSchema]);
  return zodSchema;
}
