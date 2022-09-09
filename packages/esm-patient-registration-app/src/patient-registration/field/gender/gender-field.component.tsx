import React, { useContext } from 'react';
import { RadioButton, RadioButtonGroup } from '@carbon/react';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useField } from 'formik';
import { RegistrationConfig } from '../../../config-schema';
import { useConfig } from '@openmrs/esm-framework';

export const GenderField: React.FC = () => {
  const config = useConfig() as RegistrationConfig;
  const { t } = useTranslation();
  const [field, meta] = useField('gender');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const fieldDefinition = config?.fieldDefinitions?.filter((def) => def.type === 'gender')[0];
  const setGender = (gender: string) => {
    setFieldValue('gender', gender);
  };

  return (
    <div className={styles.halfWidthInDesktopView}>
      <h4 className={styles.productiveHeading02Light}>{t('sexFieldLabelText', 'Sex')}</h4>
      <div className={styles.sexField}>
        {fieldDefinition?.gender?.length ? (
          <div>
            <p className="cds--label">{t('genderLabelText', 'Sex')}</p>
            <RadioButtonGroup name="gender" orientation="vertical" onChange={setGender} valueSelected={field.value}>
              {fieldDefinition?.gender.map((option) => (
                <RadioButton
                  key={option.label}
                  id={option.id}
                  value={option.value}
                  labelText={t(`${option.label}`, `${option.label}`)}
                />
              ))}
            </RadioButtonGroup>
            {meta.touched && meta.error && (
              <div className={styles.radioFieldError}>{t(meta.error, 'Gender is required')}</div>
            )}
          </div>
        ) : (
          <div>
            <p className="cds--label">{t('genderLabelText', 'Sex')}</p>
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
        )}
      </div>
    </div>
  );
};
