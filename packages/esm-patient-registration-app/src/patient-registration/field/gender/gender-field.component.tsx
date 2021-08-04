import React, { useContext } from 'react';
import RadioButton from 'carbon-components-react/es/components/RadioButton';
import RadioButtonGroup from 'carbon-components-react/es/components/RadioButtonGroup';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useField } from 'formik';
import { DobField } from '../dob/dob.component';

export const GenderBirthField: React.FC = () => {
  const { t } = useTranslation();
  const [field, meta] = useField('gender');
  const { setFieldValue } = useContext(PatientRegistrationContext);

  const setGender = (gender: string) => {
    setFieldValue('gender', gender);
  };

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('sexAndBirthLabel', 'Sex & Birth')}</h4>
      <div className={styles.grid}>
        <DobField />
        <div style={{ marginBottom: '1rem' }}>
          <p className="bx--label">{t('genderLabelText', 'Sex')}</p>
          <RadioButtonGroup name="gender" orientation="vertical" onChange={setGender} valueSelected={field.value}>
            <RadioButton id="male" labelText={t('maleLabelText', 'Male')} value="Male" />
            <RadioButton id="female" labelText={t('femaleLabelText', 'Female')} value="Female" />
            <RadioButton id="other" labelText={t('otherLabelText', 'Other')} value="Other" />
          </RadioButtonGroup>
          {meta.touched && meta.error && (
            <>
              <input type="hidden" data-invalid="true" />
              <div className="bx--form-requirement">{meta.error}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
