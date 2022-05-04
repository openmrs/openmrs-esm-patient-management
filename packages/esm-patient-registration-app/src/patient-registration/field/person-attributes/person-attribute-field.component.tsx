import React, { useEffect } from 'react';
import styles from './../field.scss';
import { useConceptAnswers, usePersonAttributeType } from './person-attributes.resource';
import { Select, SelectItem } from 'carbon-components-react';
import { PersonAttributeTypeResponse } from '../../patient-registration-types';
import { Input } from '../../input/basic-input/input/input.component';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';

interface Validation {
  required?: boolean;
  matches?: string;
}
interface AttributeField {
  personAttributeTypeUuid: string;
  validation?: Validation;
  placeholder?: string;
}
interface CodedPersonAttributeFieldProps extends AttributeField {
  conceptUuid: string;
}
interface FreeTextPersonAttributeFieldProps extends AttributeField {
  personAttributeTypeUuid: string;
  validation?: Validation;
  placeholder?: string;
}

type RealizedPersonAttributeFieldProps = {
  personAttributeType: PersonAttributeTypeResponse;
};

type PersonAttributeFieldProps = CodedPersonAttributeFieldProps | FreeTextPersonAttributeFieldProps;

const SelectAttributeField: React.FC<CodedPersonAttributeFieldProps & RealizedPersonAttributeFieldProps> = ({
  personAttributeType,
  validation,
  conceptUuid,
  placeholder,
}) => {
  const { data: conceptAnswers, isLoading } = useConceptAnswers(conceptUuid);

  return !isLoading ? (
    <Field name={`attributes.${personAttributeType.uuid}`}>
      {({ field }) => {
        conceptAnswers.length ? (
          <Select
            id={`person-attribute-${personAttributeType.uuid}`}
            name={`attributes.${personAttributeType.uuid}`}
            labelText={personAttributeType?.display}
            light
            required={validation?.required}
            {...field}>
            <SelectItem key="no-answer" value={undefined} text="" />
            {conceptAnswers.map((answer) => (
              <SelectItem key={answer.uuid} value={answer.uuid} text={answer.display} />
            ))}
          </Select>
        ) : (
          <Input
            id={`person-attribute-${personAttributeType.uuid}`}
            labelText={personAttributeType?.display}
            placeholder={placeholder}
            name={`attributes.${personAttributeType.uuid}`}
            light
            required={validation?.required}
            {...field}
          />
        );
      }}
    </Field>
  ) : null;
};

const FreeTextAttributeField: React.FC<FreeTextPersonAttributeFieldProps & RealizedPersonAttributeFieldProps> = ({
  personAttributeType,
  validation,
  placeholder,
}) => {
  const { t } = useTranslation();
  const validationRegex = validation?.matches;
  const validateInput = !Boolean(validationRegex)
    ? null
    : (value: string) => {
        if (
          !value ||
          !validationRegex ||
          validationRegex === '' ||
          typeof validationRegex !== 'string' ||
          value === ''
        ) {
          return;
        }

        const regex = new RegExp(validationRegex);
        if (regex.test(value)) {
          return;
        } else {
          return t('invalidInput', 'Invalid input');
        }
      };

  return (
    <Field name={`attributes.${personAttributeType.uuid}`} validate={validateInput}>
      {({ field, form: { touched, errors } }) => {
        return (
          <Input
            id={`person-attribute-${personAttributeType.uuid}`}
            labelText={`${personAttributeType?.display}${
              validation?.required ? undefined : ' ' + t('optionalTag', '(optional)')
            }`}
            placeholder={placeholder}
            light
            invalid={
              errors[`attributes.${personAttributeType.uuid}`] && touched[`attributes.${personAttributeType.uuid}`]
            }
            required={validation?.required}
            {...field}
          />
        );
      }}
    </Field>
  );
};

export const PersonAttributeField: React.FC<PersonAttributeFieldProps> = (props) => {
  const { data: personAttributeType, isLoading } = usePersonAttributeType(props.personAttributeTypeUuid);

  return isLoading ? null : (
    <div className={`${styles.attributeField} ${styles.halfWidthInDesktopView}`}>
      {'conceptUuid' in props && typeof props.conceptUuid === 'string' ? (
        <SelectAttributeField {...props} personAttributeType={personAttributeType} />
      ) : (
        <FreeTextAttributeField {...props} personAttributeType={personAttributeType} />
      )}
    </div>
  );
};
