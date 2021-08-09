import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './actions-buttons.scss';

export default function DuplicatePatientListButton() {
  const { t } = useTranslation();
  return (
    <li className="bx--overflow-menu-options__option">
      <div
        className={`bx--overflow-menu-options__btn ${styles.link}`}
        title={t('duplicateToMyLists', 'Duplicate to My Lists')}>
        <span className="bx--overflow-menu-options__option-content">
          {t('duplicateToMyLists', 'Duplicate to My Lists')}
        </span>
      </div>
    </li>
  );
}
