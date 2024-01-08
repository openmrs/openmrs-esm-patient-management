import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type ConfigObject, navigate, useConfig } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';
import styles from './open-chart.scss';
import usePatientId from './open-chart.resource';

interface OpenChartMenuProps {
  patientUuid: string;
}
const OpenChartMenu: React.FC<OpenChartMenuProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { isLoading, patient } = usePatientId(patientUuid);
  const config = useConfig() as ConfigObject;

  const redirectPatientChart = useCallback(() => {
    if (!isLoading) {
      navigate({
        to: config.customPatientChartUrl
          ? `${config.customPatientChartUrl}=${patient?.patientId}&`
          : `\${openmrsSpaBase}/patient/${patientUuid}/chart`,
      });
    }
  }, [patient, config.customPatientChartUrl]);

  return (
    <Button onClick={redirectPatientChart} className={styles.editIcon} kind="ghost">
      {config.customPatientChartText ? config.customPatientChartText : t('profile', 'Profile')}
    </Button>
  );
};

export default OpenChartMenu;
