import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './edit-patient-details-button.scss';

export default function EditPatientDetailsButton({ patientUuid }) {
  const { t } = useTranslation();
  return (
    <li className="bx--overflow-menu-options__option">
      <ConfigurableLink
        to={`\${openmrsSpaBase}/patient/${patientUuid}/edit`}
        className={`bx--overflow-menu-options__btn ${styles.link}`}
        title={t('editPatientDetails', 'Edit Patient Details')}>
        <span className="bx--overflow-menu-options__option-content">
          {t('editPatientDetails', 'Edit Patient Details')}
        </span>
      </ConfigurableLink>
    </li>
  );
}
