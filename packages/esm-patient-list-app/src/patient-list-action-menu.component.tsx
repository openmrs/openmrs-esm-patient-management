import React from 'react';
import ListBulleted20 from '@carbon/icons-react/es/list--bulleted/20';
import styles from './patient-list-action-menu.scss';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';

const PatientNoteActionMenu: React.FC = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const navigateToPatientList = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-list' }), []);
  return (
    <>
      {isTablet && (
        <div
          className={styles.patientListActionMenuContainer}
          role="button"
          tabIndex={0}
          onClick={navigateToPatientList}>
          <ListBulleted20 />
          <span>{t('patientList', 'Patient list')}</span>
        </div>
      )}
    </>
  );
};

export default PatientNoteActionMenu;
