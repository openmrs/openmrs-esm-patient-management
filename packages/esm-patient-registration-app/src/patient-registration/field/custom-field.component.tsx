import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { RegistrationConfig } from '../../config-schema';
import { AddressField } from './address/custom-address-field.component';
import { ObsField } from './obs/obs-field.component';
import { PersonAttributeField } from './person-attributes/person-attribute-field.component';

export interface CustomFieldProps {
  name: string;
}

export function CustomField({ name }: CustomFieldProps) {
  const config = useConfig() as RegistrationConfig;
  const fieldDefinition = config.fieldDefinitions.filter((def) => def.id == name)[0];

  if (fieldDefinition.type === 'person attribute') {
    return <PersonAttributeField fieldDefinition={fieldDefinition} />;
  } else if (fieldDefinition.type === 'obs') {
    return <ObsField fieldDefinition={fieldDefinition} />;
  } else if (fieldDefinition.type === 'address') {
    return <AddressField fieldDefinition={fieldDefinition} />;
  } else {
    return <div>Error: Unknown field type {fieldDefinition.type}</div>;
  }
}
