import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { spaBasePath } from './constants';

export default function OutpatientAppLink() {
  const { t } = useTranslation();
  return <ConfigurableLink to={spaBasePath}>{t('outpatient', 'Outpatient')}</ConfigurableLink>;
}
