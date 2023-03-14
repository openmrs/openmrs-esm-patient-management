import React from 'react';
import { Input } from '../../input/basic-input/input/input.component';
import { useTranslation } from 'react-i18next';

export const PhoneField: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Input
        id="phone"
        //This UUID will be fixed for all the distributions of OPENMRS.
        name="attributes.14d4f066-15f5-102d-96e4-000c29c2a5d7"
        labelText={t('phoneNumberInputLabelText', 'Phone number')}
        light
      />
    </div>
  );
};
