import React from 'react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useTranslation } from 'react-i18next';

export const PhoneField: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('phoneLabelText', 'Phone')}</h4>
      <Input
        id="phone"
        name="phone"
        labelText={t('phoneNumberInputLabelText', 'Phone number (optional)')}
        light={true}
      />
    </div>
  );
};
