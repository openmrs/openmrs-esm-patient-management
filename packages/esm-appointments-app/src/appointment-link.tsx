import React from 'react';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { spaBasePath, basePath } from './constants';

export default function AppointmentsLink() {
  const { appointmentsBaseUrl } = useConfig();
  const { t } = useTranslation();
  return <ConfigurableLink to={appointmentsBaseUrl}>{t('appointments', 'Appointments')}</ConfigurableLink>;
}
