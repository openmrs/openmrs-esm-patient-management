import React from 'react';
import { NameField } from './name/name-field.component';
import { GenderField } from './gender/gender-field.component';
import { Identifiers } from './id/id-field.component';
import { DobField } from './dob/dob.component';
import { reportError, useConfig } from '@openmrs/esm-framework';
import { builtInFields, RegistrationConfig } from '../../config-schema';
import { CustomField } from './custom-field.component';
import { AddressHierarchy } from './address/address-hierarchy.component';
import { NationalityField } from './nationality/nationality-field.component';
import { MaritalStatusField } from './marital-status/marital-status-field.component';
import { OccupationField } from './occupation/occupation-field.component';

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
    case 'maritalStatus':
      return <MaritalStatusField />;
    case 'nationality':
      return <NationalityField />;

    case 'occupation':
      return <OccupationField />;
    default:
      return <CustomField name={name} />;
  }
}
