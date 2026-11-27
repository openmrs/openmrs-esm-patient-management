import React from 'react';
import classNames from 'classnames';
import { Field } from '../../form-adapter';
import { useTranslation } from 'react-i18next';
import { Input } from '../../input/basic-input/input/input.component';
import { type PersonAttributeTypeResponse } from '../../patient-registration.types';
import { usePatternRule, type PatternRule } from '../../validation/pattern-rules';
import styles from './../field.scss';

export interface TextPersonAttributeFieldProps {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  validationRegex?: string;
  label?: string;
  required?: boolean;
}

export function TextPersonAttributeField({
  id,
  personAttributeType,
  validationRegex,
  label,
  required,
}: TextPersonAttributeFieldProps) {
  const { t } = useTranslation();

  const fieldName = `attributes.${personAttributeType.uuid}`;
  const invalidInputMessage = t('invalidInput', 'Invalid Input');
  const regexRule: PatternRule | null =
    validationRegex && typeof validationRegex === 'string'
      ? { path: fieldName, pattern: validationRegex, message: invalidInputMessage, onInvalidPattern: 'throw' }
      : null;
  usePatternRule(regexRule);

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Field name={fieldName}>
        {({ field, form: { touched, errors }, meta }) => {
          return (
            <Input
              id={id}
              name={`person-attribute-${personAttributeType.uuid}`}
              labelText={label ?? personAttributeType?.display}
              invalid={errors[fieldName] && touched[fieldName]}
              {...field}
              required={required}
            />
          );
        }}
      </Field>
    </div>
  );
}
