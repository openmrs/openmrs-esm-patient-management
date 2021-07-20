import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

export default function () {
  const { t } = useTranslation();
  return (
    <ConfigurableLink to="${openmrsSpaBase}/patient-list">
      {t('patientListAppMenuLink', 'Patient List')}
    </ConfigurableLink>
  );
}
