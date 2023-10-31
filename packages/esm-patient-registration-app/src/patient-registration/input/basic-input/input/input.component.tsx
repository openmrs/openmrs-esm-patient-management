import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, TextInput } from '@carbon/react';
import { useField } from 'formik';

// FIXME Temporarily imported here
export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'id' | 'size' | 'value'> {
  /**
   * Specify an optional className to be applied to the `<input>` node
   */
  className?: string;

  /**
   * Optionally provide the default value of the `<input>`
   */
  defaultValue?: string | number;

  /**
   * Specify whether the `<input>` should be disabled
   */
  disabled?: boolean;

  /**
   * Specify whether to display the character counter
   */
  enableCounter?: boolean;

  /**
   * Provide text that is used alongside the control label for additional help
   */
  helperText?: React.ReactNode;

  /**
   * Specify whether you want the underlying label to be visually hidden
   */
  hideLabel?: boolean;

  /**
   * Specify a custom `id` for the `<input>`
   */
  id: string;

  /**
   * `true` to use the inline version.
   */
  inline?: boolean;

  /**
   * Specify whether the control is currently invalid
   */
  invalid?: boolean;

  /**
   * Provide the text that is displayed when the control is in an invalid state
   */
  invalidText?: React.ReactNode;

  /**
   * Provide the text that will be read by a screen reader when visiting this
   * control
   */
  labelText: React.ReactNode;

  /**
   * `true` to use the light version. For use on $ui-01 backgrounds only.
   * Don't use this to make tile background color same as container background color.
   * 'The `light` prop for `TextInput` has ' +
      'been deprecated in favor of the new `Layer` component. It will be removed in the next major release.'
   */
  light?: boolean;

  /**
   * Max character count allowed for the input. This is needed in order for enableCounter to display
   */
  maxCount?: number;

  /**
   * Optionally provide an `onChange` handler that is called whenever `<input>`
   * is updated
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Optionally provide an `onClick` handler that is called whenever the
   * `<input>` is clicked
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * Specify the placeholder attribute for the `<input>`
   */
  placeholder?: string;

  /**
   * Whether the input should be read-only
   */
  readOnly?: boolean;

  /**
   * Specify the size of the Text Input. Currently supports the following:
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Specify the type of the `<input>`
   */
  type?: string;

  /**
   * Specify the value of the `<input>`
   */
  value?: string | number | undefined;

  /**
   * Specify whether the control is currently in warning state
   */
  warn?: boolean;

  /**
   * Provide the text that is displayed when the control is in warning state
   */
  warnText?: React.ReactNode;
}

interface InputProps extends TextInputProps {
  checkWarning?(value: string): string;
}

export const Input: React.FC<InputProps> = ({ checkWarning, ...props }) => {
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

  const labelText = props.required ? props.labelText : `${props.labelText} (${t('optional', 'optional')})`;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Layer>
        <TextInput
          {...props}
          {...field}
          labelText={labelText}
          invalid={!!(meta.touched && meta.error)}
          invalidText={invalidText}
          warn={!!warnText}
          warnText={warnText}
          value={value}
        />
      </Layer>
    </div>
  );
};
