import React, { useContext } from 'react';
import { RadioButton, RadioButtonGroup } from '@carbon/react';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useField } from 'formik';
import { RegistrationConfig } from '../../../config-schema';
import { useConfig } from '@openmrs/esm-framework';
import { Input } from '../../input/basic-input/input/input.component';

export const OccupationField: React.FC = () => {
  const { fieldConfigurations } = useConfig() as RegistrationConfig;
  const { t } = useTranslation();
  const [field, meta] = useField('nationality');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const fieldConfigs = fieldConfigurations?.nationality;
  console.log('the field configurations', fieldConfigs);

  const setOccupation = (occupation: string) => {
    setFieldValue('occupation', occupation);
  };

  const containsNoNumbers = /^([^0-9]*)$/;

  function checkNumber(value: string) {
    if (!containsNoNumbers.test(value)) {
      return 'numberInNameDubious';
    }

    return undefined;
  }

  return (
    <div className={styles.halfWidthInDesktopView}>
      <h4 className={styles.productiveHeading02Light}>{t('occupationLabelText', 'Occupation')}</h4>
      <div className={styles.sexField}>
        <Input
          id="occupation"
          name="occupation"
          labelText={t('occupationLabelText', 'Occupation')}
          checkWarning={checkNumber}
        />
      </div>
    </div>
  );
};
