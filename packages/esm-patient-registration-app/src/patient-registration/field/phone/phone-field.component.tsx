import React from 'react';
import { PersonAttributeField } from '../person-attributes/person-attribute-field.component';

export function PhoneField() {
  const fieldDefinition = {
    id: 'phone',
    type: 'person attribute',
    uuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
    showHeading: false,
  };
  return <PersonAttributeField fieldDefinition={fieldDefinition} />;
}
