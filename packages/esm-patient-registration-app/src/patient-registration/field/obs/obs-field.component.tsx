import { InlineNotification } from 'carbon-components-react';
import React from 'react';
import { FieldDefinition } from '../../../config-schema';
import { useConcept } from '../field.resource';

export interface ObsFieldProps {
  fieldDefinition: FieldDefinition;
}

export function ObsField({ fieldDefinition }: ObsFieldProps) {
  const { data: concept, isLoading } = useConcept(fieldDefinition.uuid);

  if (isLoading) {
    return null;
  }
  switch (concept.) {
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