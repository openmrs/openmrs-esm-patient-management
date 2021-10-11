import React, { useContext } from 'react';
import { DatePicker, DatePickerInput, TextInput } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { generateFormatting } from '../../date-util';

export const DobField: React.FC = () => {
  const { t } = useTranslation();
  const [field, meta] = useField('birthdate');
  const [estimated] = useField('birthdateEstimated');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const { format, placeHolder, dateFormat } = generateFormatting(['d', 'm', 'Y'], '/');
  const invalidText = meta.error && t(meta.error);

  const onDateChange = ([birthdate]) => {
    setFieldValue('birthdate', birthdate);
    setFieldValue('birthdateEstimated', false);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <DatePicker dateFormat={dateFormat} datePickerType="single" light onChange={onDateChange}>
        <DatePickerInput
          id="birthdate"
          placeholder={placeHolder}
          labelText={t('dateOfBirthLabelText', 'Date of Birth')}
          invalid={!!(meta.touched && meta.error)}
          invalidText={invalidText}
          {...field}
          value={estimated.value ? '' : format(field.value)}
        />
      </DatePicker>
    </div>
  );
};

export const EobField: React.FC = () => {
  const { t } = useTranslation();
  const today = new Date();
  const [field] = useField('birthdate');
  const [estimated] = useField('birthdateEstimated');
  const { setFieldValue } = useContext(PatientRegistrationContext);

  const onValueChange = (ev) => {
    const years = +ev.target.value;

    if (!isNaN(years) && years < 1000 && years >= 0) {
      setFieldValue('birthdate', new Date(today.getFullYear() - years, 0, 1));
      setFieldValue('birthdateEstimated', true);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <TextInput
        id="birthdateEstimated"
        light
        onChange={onValueChange}
        labelText={t('estimatedYearsLabelText', 'Estimated Years')}
        value={estimated.value && field.value ? `${today.getFullYear() - field.value.getFullYear()}` : ''}
      />
    </div>
  );
};
