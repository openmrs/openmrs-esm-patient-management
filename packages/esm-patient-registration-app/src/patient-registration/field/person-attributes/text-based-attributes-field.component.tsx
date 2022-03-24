import React from 'react';
import { Input } from '../../input/basic-input/input/input.component';
import { useConfig } from '@openmrs/esm-framework';
import { TextBasedPersonAttributeConfig } from '../../patient-registration-types';
import { usePersonAttributeType } from './person-attributes.resource';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import { PersonAttributeField } from './person-attribute-field.component';

export interface TextBasedAttributesFieldProps {}

export const TextBasedAttributesField: React.FC<TextBasedAttributesFieldProps> = () => {
  const { textBasedAttributes } = useConfig();

  return textBasedAttributes?.length ? (
    <div>
      {textBasedAttributes.map((personAttributeType: TextBasedPersonAttributeConfig, ind) => (
        <TextBasedPersonAttributeField
          key={ind}
          personAttributeTypeUuid={personAttributeType.personAttributeUuid}
          validationRegex={personAttributeType.validationRegex}
        />
      ))}
    </div>
  ) : null;
};

interface TextBasedPersonAttributeFieldProps {
  personAttributeTypeUuid: string;
  validationRegex: string;
}

export const TextBasedPersonAttributeField: React.FC<TextBasedPersonAttributeFieldProps> = ({
  personAttributeTypeUuid,
  validationRegex,
}) => {
  const { data: personAttributeType, isLoading } = usePersonAttributeType(personAttributeTypeUuid);
  const { t } = useTranslation();

  const validateInput = (value) => {
    if (!value || !validationRegex || validationRegex === '' || value === '') {
      return null;
    }
    const regex = new RegExp(validationRegex);
    if (regex.test(value)) {
      return null;
    } else {
      return t('invalidInput', 'Invalid Input');
    }
  };

  const inputField = (
    <Field name={`attributes.${personAttributeTypeUuid}.value`} validate={validateInput}>
      {({ field, form: { touched, errors } }) => {
        return (
          <>
            <Input
              id={`person-attribute-${personAttributeTypeUuid}`}
              labelText={''}
              hideLabel
              light
              invalid={
                errors[`attributes.${personAttributeTypeUuid}.value`] &&
                touched[`attributes.${personAttributeTypeUuid}.value`]
              }
              {...field}
            />
          </>
        );
      }}
    </Field>
  );

  return (
    <PersonAttributeField
      isLoadingPersonAttributeTypeDetails={isLoading}
      personAttributeTypeUuid={personAttributeTypeUuid}
      personAttributeTypeName={personAttributeType?.name}
      inputField={inputField}
    />
  );
};
