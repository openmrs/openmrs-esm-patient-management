import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { RegistrationConfig } from '../../config-schema';
import { PersonAttributeField } from './person-attributes/person-attribute-field.component';

export interface CustomFieldProps {
  name: string;
}

export function CustomField({ name }: CustomFieldProps) {
  const config = useConfig() as RegistrationConfig;
  const fieldDefinition = config.fieldDefinitions.filter((def) => def.id == name)[0];

  return <PersonAttributeField fieldDefinition={fieldDefinition} />;
}
