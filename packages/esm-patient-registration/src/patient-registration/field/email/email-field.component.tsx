import React from 'react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useTranslation } from 'react-i18next';

export const EmailField: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>Email</h4>
      <Input id="email" name="email" labelText={t('emailLabelText', 'Email')} light={true} />
    </div>
  );
};
