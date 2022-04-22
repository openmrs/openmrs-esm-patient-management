import React, { useContext } from 'react';
import { RadioButton, RadioButtonGroup } from 'carbon-components-react';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useField } from 'formik';

export const GenderField: React.FC = () => {
  const { t } = useTranslation();
  const [field, meta] = useField('gender');
  const { setFieldValue } = useContext(PatientRegistrationContext);

  const setGender = (gender: string) => {
    setFieldValue('gender', gender);
  };

  return (
    <div className={styles.halfWidthInDesktopView}>
      <h4 className={styles.productiveHeading02Light}>{t('sexFieldLabelText', 'Sex')}</h4>
      <div className={styles.sexField}>
        <p className="bx--label">{t('genderLabelText', 'Sex')}</p>
        <RadioButtonGroup name="gender" orientation="vertical" onChange={setGender} valueSelected={field.value}>
          <RadioButton id="male" labelText={t('maleLabelText', 'Male')} value="Male" />
          <RadioButton id="female" labelText={t('femaleLabelText', 'Female')} value="Female" />
          <RadioButton id="other" labelText={t('otherLabelText', 'Other')} value="Other" />
          <RadioButton id="unknown" labelText={t('unknownLabelText', 'Unknown')} value="Unknown" />
        </RadioButtonGroup>
        {meta.touched && meta.error && (
          <div className={styles.radioFieldError}>{t(meta.error, 'Gender is required')}</div>
        )}
      </div>
    </div>
  );
};
