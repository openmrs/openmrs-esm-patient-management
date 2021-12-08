import React, { useContext } from 'react';
import { RadioButton, RadioButtonGroup } from 'carbon-components-react';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useField } from 'formik';
import { DobField, EobField } from '../dob/dob.component';

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
        <div className={styles.ageField}>
          <DobField />
          <EobField />
        </div>
        <div className={styles.sexField}>
          <RadioButtonGroup
            name="gender"
            legendText={t('genderLabelText', 'Sex')}
            orientation="vertical"
            onChange={setGender}
            valueSelected={field.value}>
            <RadioButton className={styles.radioButton} id="male" labelText={t('maleLabelText', 'Male')} value="Male" />
            <RadioButton
              className={styles.radioButton}
              id="female"
              labelText={t('femaleLabelText', 'Female')}
              value="Female"
            />
            <RadioButton
              className={styles.radioButton}
              id="other"
              labelText={t('otherLabelText', 'Other')}
              value="Other"
            />
          </RadioButtonGroup>
          {meta.touched && meta.error && (
            <>
              <input type="hidden" data-invalid="true" />
              <div className="bx--form-requirement">{t(meta.error)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
