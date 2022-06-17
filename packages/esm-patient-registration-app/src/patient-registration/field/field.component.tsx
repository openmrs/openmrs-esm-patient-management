import React from 'react';
import { AddressField } from './address/address-field.component';
import { PhoneEmailField } from './email/email-field.component';
import { NameField } from './name/name-field.component';
import { GenderField } from './gender/gender-field.component';
import { IdField } from './id/id-field.component';
import { DobField } from './dob/dob.component';
import { reportError, useConfig } from '@openmrs/esm-framework';
import { builtInFields, RegistrationConfig } from '../../config-schema';
import { CustomField } from './custom-field.component';

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
      return <AddressField />;
    case 'id':
      return <IdField />;
    case 'phone & email':
      return <PhoneEmailField />;
    default:
      return <CustomField name={name} />;
  }
}
