import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Add, Calendar } from '@carbon/react/icons';
import { formatDate, navigate } from '@openmrs/esm-framework';
import Illustration from '../illo.component';
import styles from './header.scss';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const newCohortUrl = window.getOpenmrsSpaBase() + 'home/patient-lists?new_cohort=true';

  const handleShowNewListOverlay = () => {
    // URL navigation is in place to know either to open the create list overlay or not
    // The url /patient-list?new_cohort=true is being used in the "Add patient to list" widget
    // in the patient chart. The button in the above mentioned widget "Create new list", navigates
    // to /patient-list?new_cohort=true to open the overlay directly.
    navigate({
      to: newCohortUrl,
    });
  };

  return (
    <div className={styles.patientListHeader}>
      <div className={styles.leftJustifiedItems}>
        <Illustration />
        <div className={styles.pageLabels}>
          <p>{t('patientLists', 'Patient lists')}</p>
          <p className={styles.pageName}>{t('home', 'Home')}</p>
        </div>
      </div>
      <div className={styles.rightJustifiedItems}>
        <div className={styles.date}>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
        <Button
          className={styles.newListButton}
          kind="ghost"
          iconDescription="Add"
          renderIcon={(props) => <Add {...props} size={16} />}
          onClick={handleShowNewListOverlay}
          size="sm">
          {t('newList', 'New list')}
        </Button>
      </div>
    </div>
  );
};

export default Header;
