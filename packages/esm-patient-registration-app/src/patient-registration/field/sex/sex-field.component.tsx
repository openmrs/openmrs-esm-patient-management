import React, { useContext } from 'react';
import { RadioButton, RadioButtonGroup } from 'carbon-components-react';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useField } from 'formik';

export const SexField: React.FC = () => {
  const { t } = useTranslation();
  const [field, meta] = useField('gender');
  const { setFieldValue } = useContext(PatientRegistrationContext);

  const setSex = (sex: string) => {
    setFieldValue('gender', sex);
  };

  return (
    <div className={styles.sexField}>
      <RadioButtonGroup name="sex" orientation="vertical" onChange={setSex} valueSelected={field.value}>
        <RadioButton id="male" labelText={t('maleLabelText', 'Male')} value="Male" />
        <RadioButton id="female" labelText={t('femaleLabelText', 'Female')} value="Female" />
        <RadioButton id="other" labelText={t('otherLabelText', 'Other')} value="Other" />
        <RadioButton id="unknown" labelText={t('unknownLabelText', 'Unknown')} value="Unknown" />
      </RadioButtonGroup>
      {meta.touched && meta.error && <div className={styles.radioFieldError}>{t(meta.error, 'Sex is required')}</div>}
    </div>
  );
};
