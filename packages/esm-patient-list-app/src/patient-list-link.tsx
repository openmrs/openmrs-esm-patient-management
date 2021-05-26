import React from 'react';
import { useTranslation } from 'react-i18next';

export default function () {
  const { t } = useTranslation();
  return <a href={`${window.spaBase}/patient-list`}>{t('patientListAppMenuLink', 'Patient List')}</a>;
}
