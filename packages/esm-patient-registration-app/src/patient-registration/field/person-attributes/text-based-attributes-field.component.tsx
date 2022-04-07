import React from 'react';
import styles from './../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useConfig } from '@openmrs/esm-framework';
import { TextBasedPersonAttributeConfig } from '../../patient-registration-types';
import { usePersonAttributeType } from './person-attributes.resource';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';

export interface TextBasedAttributesFieldProps {}

export const TextBasedAttributesField: React.FC<TextBasedAttributesFieldProps> = () => {
  const { textBasedAttributes } = useConfig();

  return textBasedAttributes?.length ? (
    <div>
      {textBasedAttributes.map((personAttributeType: TextBasedPersonAttributeConfig, ind) => (
        <PersonAttributeField
          key={ind}
          personAttributeTypeUuid={personAttributeType.personAttributeUuid}
          validationRegex={personAttributeType.validationRegex}
        />
      ))}
    </div>
  ) : null;
};

interface PersonAttributeFieldProps {
  personAttributeTypeUuid: string;
  validationRegex: string;
}

const PersonAttributeField: React.FC<PersonAttributeFieldProps> = ({ personAttributeTypeUuid, validationRegex }) => {
  const { data: personAttributeType, isLoading } = usePersonAttributeType(personAttributeTypeUuid);
  const { t } = useTranslation();

  const validateInput = (value) => {
    let error;
    if (!value || !validationRegex || validationRegex === '' || typeof validationRegex !== 'string' || value === '') {
      return error;
    }
    const regex = new RegExp(validationRegex);
    if (regex.test(value)) {
      return error;
    } else {
      error = t('invalidInput', 'Invalid Input');
    }

    return error;
  };

  return !isLoading ? (
    <div className={`${styles.attributeField} ${styles.halfWidthInDesktopView}`}>
      <Field name={`attributes.${personAttributeTypeUuid}`} validate={validateInput}>
        {({ field, form: { touched, errors }, meta }) => {
          return (
            <Input
              id={`person-attribute-${personAttributeTypeUuid}`}
              labelText={personAttributeType?.display}
              light
              invalid={
                errors[`attributes.${personAttributeTypeUuid}`] && touched[`attributes.${personAttributeTypeUuid}`]
              }
              {...field}
            />
          );
        }}
      </Field>
    </div>
  ) : null;
};
