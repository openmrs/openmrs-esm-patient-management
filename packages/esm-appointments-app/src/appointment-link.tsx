import React from 'react';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { spaBasePath, basePath } from './constants';

export default function AppointmentsLink() {
  const { useAnotherBaseUrl, alternativeBaseUrl } = useConfig();
  const appointmentsUrl = useAnotherBaseUrl ? `${alternativeBaseUrl}${basePath}` : spaBasePath;
  const { t } = useTranslation();
  return <ConfigurableLink to={appointmentsUrl}>{t('appointments', 'Appointments')}</ConfigurableLink>;
}
