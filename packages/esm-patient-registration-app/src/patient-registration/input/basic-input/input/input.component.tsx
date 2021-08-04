import React from 'react';
import TextInput from 'carbon-components-react/es/components/TextInput';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';

interface InputProps {
  id: string;
  name: string;
  labelText: string;
  light: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const Input: React.FC<InputProps> = (props) => {
  const [field, meta] = useField(props.name);
  const { t } = useTranslation();
  /*
    t('givenNameRequired')
    t('familyNameRequired', 'Family name is required')
    t('genderUnspecified', 'Gender is unspecified')
    t('genderRequired', 'Gender is required')
    t('birthdayRequired', 'Birthdate is required')
    t('birthdayNotInTheFuture', 'Birthdate cannot be in the future')
    t('negativeYears', 'Years cannot be less than 0')
    t('negativeMonths', 'Months cannot be less than 0')
    t('deathdayNotInTheFuture', 'Date of Death cannot be in the future')
    t('invalidEmail', 'A valid email has to be given')
  */
  const invalidText = meta.error && t(meta.error);

  return (
    <div style={{ marginBottom: '1rem', maxWidth: '360px' }}>
      <TextInput
        {...props}
        {...field}
        invalid={!!(meta.touched && meta.error)}
        invalidText={invalidText}
        value={field.value || ''}
      />
    </div>
  );
};
