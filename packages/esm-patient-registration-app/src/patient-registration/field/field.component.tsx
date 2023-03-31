import React from 'react';
import { NameField } from './name/name-field.component';
import { GenderField } from './gender/gender-field.component';
import { Identifiers } from './id/id-field.component';
import { DobField } from './dob/dob.component';
import { reportError, useConfig } from '@openmrs/esm-framework';
import { builtInFields, RegistrationConfig } from '../../config-schema';
import { CustomField } from './custom-field.component';
import { AddressHierarchy } from './address/address-hierarchy.component';

export interface FieldProps {
  name: string;
}

export function Field({ name }: FieldProps) {
  const config = useConfig() as RegistrationConfig;
  if (
    !(builtInFields as ReadonlyArray<string>).includes(name) &&
    !config.fieldDefinitions.some((def) => def.id == name)
  ) {
    reportError(
      `Invalid field name '${name}'. Valid options are '${config.fieldDefinitions
        .map((def) => def.id)
        .concat(builtInFields)
        .join("', '")}'.`,
    );
    return null;
  }

  switch (name) {
    case 'name':
      return <NameField />;
    case 'gender':
      return <GenderField />;
    case 'dob':
      return <DobField />;
    case 'address':
      return <AddressHierarchy />;
    case 'id':
      return <Identifiers />;
    default:
      return <CustomField name={name} />;
  }
}
