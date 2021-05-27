import React from 'react';
import styles from '../field.scss';
import DatePicker from 'carbon-components-react/es/components/DatePicker';
import DatePickerInput from 'carbon-components-react/es/components/DatePickerInput';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { generateFormatting } from '../../date-util';

export const DobField: React.FC = () => {
  const { t } = useTranslation();
  const [field, meta] = useField('birthdate');
  const { setFieldValue } = React.useContext(PatientRegistrationContext);
  const { format, placeHolder, dateFormat } = generateFormatting(['d', 'm', 'Y'], '/');

  const onDateChange = ([birthdate]) => {
    setFieldValue('birthdate', birthdate);
  };

  // TODO: remove custom styling soon.
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h4 className={styles.productiveHeading02Light}>{t('dobLabelText', 'Birth')}</h4>
      <DatePicker dateFormat={dateFormat} datePickerType="single" light onChange={onDateChange}>
        <DatePickerInput
          id="birthdate"
          placeholder={placeHolder}
          labelText={t('dateOfBirthLabelText', 'Date of Birth')}
          invalid={!!(meta.touched && meta.error)}
          invalidText={meta.error}
          {...field}
          value={format(new Date(field.value))}
        />
      </DatePicker>
    </div>
  );
};
