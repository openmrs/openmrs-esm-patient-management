import { InlineNotification } from 'carbon-components-react';
import React from 'react';
import { FieldDefinition } from '../../../config-schema';
import { CodedPersonAttributeField } from './coded-person-attribute-field.component';
import { usePersonAttributeType } from './person-attributes.resource';
import { TextPersonAttributeField } from './text-person-attribute-field.component';

export interface PersonAttributeFieldProps {
  fieldDefinition: FieldDefinition;
}

export function PersonAttributeField({ fieldDefinition }: PersonAttributeFieldProps) {
  const { data: personAttributeType, isLoading } = usePersonAttributeType(fieldDefinition.uuid);

  if (isLoading) {
    return null;
  }
  switch (personAttributeType.format) {
    case 'java.lang.String':
      return (
        <TextPersonAttributeField
          personAttributeType={personAttributeType}
          validationRegex={fieldDefinition.validation.matches}
          label={fieldDefinition.label}
        />
      );
    case 'org.openmrs.Concept':
      return (
        <CodedPersonAttributeField
          personAttributeType={personAttributeType}
          answerConceptSetUuid={fieldDefinition.answerConceptSetUuid}
          label={fieldDefinition.label}
        />
      );
    default:
      return (
        <InlineNotification kind="error" title="Error">
          Patient attribute type has unknown format "{personAttributeType.format}"
        </InlineNotification>
      );
  }
}
