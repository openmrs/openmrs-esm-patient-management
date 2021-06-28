import React from 'react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useTranslation } from 'react-i18next';
import { PhoneField } from '../phone/phone-field.component';

export const PhoneEmailField: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('phoneEmailLabelText', 'Phone & Email')}</h4>
      <div className={styles.grid}>
        <PhoneField />
        <Input id="email" name="email" labelText={t('emailLabelText', 'Email')} light={true} />
      </div>
    </div>
  );
};
