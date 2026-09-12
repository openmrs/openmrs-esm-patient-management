import React from 'react';
import { reportError, useConfig } from '@openmrs/esm-framework';
import { builtInFields, type RegistrationConfig } from '../../config-schema';
import { usePatientRegistrationContext } from '../patient-registration-context';
import { shouldHideElement } from '../patient-registration-utils';
import { AddressComponent } from './address/address-field.component';
import { CauseOfDeathField } from './cause-of-death/cause-of-death.component';
import { CustomField } from './custom-field.component';
import { DateAndTimeOfDeathField } from './date-and-time-of-death/date-and-time-of-death.component';
import { DobField } from './dob/dob.component';
import { GenderField } from './gender/gender-field.component';
import { Identifiers } from './id/id-field.component';
import { NameField } from './name/name-field.component';
import { PhoneField } from './phone/phone-field.component';

export interface FieldProps {
  name: string;
}

export function Field({ name }: FieldProps) {
  const config = useConfig<RegistrationConfig>();
  const { values } = usePatientRegistrationContext();

  if (
    !(builtInFields as ReadonlyArray<string>).includes(name) &&
    !config.fieldDefinitions.some((def) => def.id === name)
  ) {
    reportError(
      `Invalid field name '${name}'. Valid options are '${config.fieldDefinitions
        .map((def) => def.id)
        .concat(builtInFields)
        .join("', '")}'.`,
    );
    return null;
  }

  const fieldDef = config.fieldDefinitions.find((def) => def.id === name);
  if (fieldDef) {
    const ageInYears = values.birthdate
      ? new Date().getFullYear() - new Date(values.birthdate).getFullYear()
      : (values.yearsEstimated ?? undefined);

    if (shouldHideElement(fieldDef, values, config, ageInYears)) {
      return null;
    }
  }

  switch (name) {
    case 'name':
      return <NameField />;
    case 'gender':
      return <GenderField />;
    case 'dob':
      return <DobField />;
    case 'dateAndTimeOfDeath':
      return <DateAndTimeOfDeathField />;
    case 'causeOfDeath':
      return <CauseOfDeathField />;
    case 'address':
      return <AddressComponent />;
    case 'id':
      return <Identifiers />;
    case 'phone':
      return <PhoneField />;
    default:
      return <CustomField name={name} />;
  }
}
