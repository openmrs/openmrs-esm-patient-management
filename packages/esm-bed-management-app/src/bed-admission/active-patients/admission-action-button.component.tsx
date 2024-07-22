import React from 'react';
import { Button, Tooltip } from '@carbon/react';
import { HospitalBed } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './admission-action-button-styles.scss';

const AdmissionActionButton = ({ entry, handleBedAssigmentModal, buttonText }) => {
  const { t } = useTranslation();
  return (
    <Tooltip align="bottom" label={t('buttonTooltip', buttonText)}>
      <Button
        className={styles.actionButton}
        kind="ghost"
        renderIcon={HospitalBed}
        onClick={() => handleBedAssigmentModal(entry)}
        iconDescription={t('buttonText', buttonText)}></Button>
    </Tooltip>
  );
};

export default AdmissionActionButton;
