import React, { useMemo } from 'react';
import { InlineNotification, TextInputSkeleton } from '@carbon/react';
import { FieldDefinition } from '../../../config-schema';
import { CodedPersonAttributeField } from './coded-person-attribute-field.component';
import { usePersonAttributeType } from './person-attributes.resource';
import { TextPersonAttributeField } from './text-person-attribute-field.component';
import { useTranslation } from 'react-i18next';
import styles from '../field.scss';

export interface PersonAttributeFieldProps {
  fieldDefinition: FieldDefinition;
}

export function PersonAttributeField({ fieldDefinition }: PersonAttributeFieldProps) {
  const { data: personAttributeType, isLoading, error } = usePersonAttributeType(fieldDefinition.uuid);
  const { t } = useTranslation();

  const personAttributeField = useMemo(() => {
    if (!personAttributeType) {
      return null;
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
  }, [personAttributeType, fieldDefinition, t]);

  if (isLoading) {
    return <TextInputSkeleton />;
  }

  if (error) {
    return (
      <div>
        <h4 className={styles.productiveHeading02Light}>{fieldDefinition?.label}</h4>
        <InlineNotification kind="error" title={`${t('error', 'Error')} ${error?.response?.status}`}>
          {t('unableToFetch', 'Unable to fetch person attribute type - {personattributetype}', {
            personattributetype: fieldDefinition?.label ?? fieldDefinition?.id,
          })}
        </InlineNotification>
      </div>
    );
  }

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{fieldDefinition?.label ?? personAttributeType?.display}</h4>
      {personAttributeField}
    </div>
  );
}
