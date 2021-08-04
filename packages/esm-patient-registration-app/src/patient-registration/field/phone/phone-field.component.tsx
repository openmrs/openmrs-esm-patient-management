import React from 'react';
import { Input } from '../../input/basic-input/input/input.component';
import { useTranslation } from 'react-i18next';

export const PhoneField: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Input id="phone" name="phone" labelText={t('phoneNumberInputLabelText', 'Phone number (optional)')} light />
    </div>
  );
};
