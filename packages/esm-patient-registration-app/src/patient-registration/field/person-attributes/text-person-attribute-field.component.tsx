import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Input } from '../../input/basic-input/input/input.component';
import { usePatternRule } from '../../validation/pattern-rules';
import type { PersonAttributeTypeResponse } from '../../patient-registration.types';
import type { PatternRule } from '../../validation/pattern-rules';
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
      <Input id={id} name={fieldName} labelText={label ?? personAttributeType?.display} required={required} />
    </div>
  );
}
