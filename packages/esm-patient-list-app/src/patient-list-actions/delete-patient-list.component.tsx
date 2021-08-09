import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './actions-buttons.scss';

export default function DeletePatientListButton() {
  const { t } = useTranslation();
  return (
    <li className="bx--overflow-menu-options__option bx--overflow-menu-options__option--danger">
      <div className={`bx--overflow-menu-options__btn ${styles.link}`} title={t('delete', 'Delete')}>
        <span className="bx--overflow-menu-options__option-content">{t('delete', 'Delete')}</span>
      </div>
    </li>
  );
}
