import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { useTranslation } from 'react-i18next';
import { Calendar, Hospital } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { isDesktop, navigate, useLayoutType } from '@openmrs/esm-framework';
import { spaHomePage } from '../constants';
import { useAppointmentsStore } from '../store';
import styles from './metrics-header.scss';
import { launchCreateAppointmentForm } from '../helpers';

dayjs.extend(isToday);

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'md';

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.metricsContent}>
        <Button
          kind="tertiary"
          renderIcon={Calendar}
          size={responsiveSize}
          onClick={() =>
            navigate({ to: `${spaHomePage}/appointments/calendar/${dayjs(selectedDate).format('YYYY-MM-DD')}` })
          }>
          {t('appointmentsCalendar', 'Appointments calendar')}
        </Button>
        <Button
          kind="primary"
          renderIcon={(props) => <Hospital size={32} {...props} />}
          size={responsiveSize}
          onClick={() => launchCreateAppointmentForm(t)}>
          {t('createNewAppointment', 'Create new appointment')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
