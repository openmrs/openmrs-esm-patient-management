import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './actions-buttons.scss';
import Button from 'carbon-components-react/es/components/Button';

export default function EditPatientListDetailsButton() {
  const { t } = useTranslation();
  return (
    <li className="bx--overflow-menu-options__option">
      <div
        className={`bx--overflow-menu-options__btn ${styles.link}`}
        title={t('editNameDescription', 'Edit name / description')}>
        <span className="bx--overflow-menu-options__option-content">
          {t('editNameDescription', 'Edit name / description')}
        </span>
      </div>
    </li>
  );
}
