import React from 'react';
import { InlineNotification, TextInputSkeleton } from '@carbon/react';
import { FieldDefinition } from '../../../config-schema';
import { CodedPersonAttributeField } from './coded-person-attribute-field.component';
import { usePersonAttributeType } from './person-attributes.resource';
import { TextPersonAttributeField } from './text-person-attribute-field.component';
import { useTranslation } from 'react-i18next';

export interface PersonAttributeFieldProps {
  fieldDefinition: FieldDefinition;
}

export function PersonAttributeField({ fieldDefinition }: PersonAttributeFieldProps) {
  const { data: personAttributeType, isLoading, error } = usePersonAttributeType(fieldDefinition.uuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <TextInputSkeleton />;
  }

  if (error) {
    return (
      <InlineNotification kind="error" title={`${t('error', 'Error')} ${error?.response?.status}`}>
        {t('unableToFetch', 'Unable to fetch person attribute type {personattributetype}', {
          personattributetype: fieldDefinition?.id,
        })}
      </InlineNotification>
    );
  }

  switch (personAttributeType.format) {
    case 'java.lang.String':
      return (
        <TextPersonAttributeField
          personAttributeType={personAttributeType}
          validationRegex={fieldDefinition.validation.matches}
          label={fieldDefinition.label}
          required={fieldDefinition.validation.required}
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
