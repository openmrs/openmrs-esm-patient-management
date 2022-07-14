import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, TextInputProps } from '@carbon/react';
import { useField } from 'formik';

interface InputProps extends TextInputProps {
  checkWarning?(value: string): string;
}

export const Input: React.FC<any> = ({ checkWarning, ...props }) => {
  const [field, meta] = useField(props.name);
  const { t } = useTranslation();

  /*
    Do not remove these comments
    t('givenNameRequired')
    t('familyNameRequired')
    t('genderUnspecified')
    t('genderRequired')
    t('birthdayRequired')
    t('birthdayNotInTheFuture')
    t('negativeYears')
    t('negativeMonths')
    t('deathdayNotInTheFuture')
    t('invalidEmail')
    t('numberInNameDubious')
    t('yearsEstimateRequired')
  */

  const value = field.value || '';
  const invalidText = meta.error && t(meta.error);
  const warnText = useMemo(() => {
    if (!invalidText && typeof checkWarning === 'function') {
      const warning = checkWarning(value);
      return warning && t(warning);
    }

    return undefined;
  }, [checkWarning, invalidText, value, t]);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <TextInput
        {...props}
        {...field}
        invalid={!!(meta.touched && meta.error)}
        invalidText={invalidText}
        warn={!!warnText}
        warnText={warnText}
        value={value}
      />
    </div>
  );
};
