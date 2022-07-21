import React from 'react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useTranslation } from 'react-i18next';
import { PhoneField } from '../phone/phone-field.component';

export const PhoneEmailField: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('phoneEmailLabelText', 'Phone, Email, etc.')}</h4>
      <div className={styles.grid}>
        <PhoneField />
        <Input
          id="email"
          // This UUID will be fixed for all the distributions in OPENMRS
          name="attributes.ac7d7773-fe9f-11ec-8b9b-0242ac1b0002"
          labelText={t('emailLabelText', 'Email')}
          light
        />
      </div>
    </div>
  );
};
