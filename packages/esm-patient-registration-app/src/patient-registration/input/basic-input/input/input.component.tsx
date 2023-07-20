import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, TextInput, TextInputProps } from '@carbon/react';
import { useField } from 'formik';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from '../../input.scss';

interface InputProps extends TextInputProps {
  checkWarning?(value: string): string;
}

export const Input: React.FC<any> = ({ checkWarning, ...props }) => {
  const [field, meta] = useField(props.name);
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

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

  const labelText = props.required ? props.labelText : `${props.labelText} (${t('optional', 'optional')})`;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Layer>
        <TextInput
          className={styles.Input}
          {...props}
          {...field}
          labelText={labelText}
          invalid={!!(meta.touched && meta.error)}
          invalidText={invalidText}
          warn={!!warnText}
          warnText={warnText}
          size={isTablet ? 'lg' : 'md'}
          value={value}
        />
      </Layer>
    </div>
  );
};
