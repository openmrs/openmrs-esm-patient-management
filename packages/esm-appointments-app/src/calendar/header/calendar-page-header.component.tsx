import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { PageHeader, PageHeaderContent, AppointmentsPictogram } from '@openmrs/esm-framework';
import { launchCreateAppointmentForm } from '../../helpers/functions';
import styles from './calendar-page-header.scss';

interface CalendarPageHeaderProps {
  filterElement?: React.ReactNode;
}

const CalendarPageHeader: React.FC<CalendarPageHeaderProps> = ({ filterElement }) => {
  const { t } = useTranslation();

  return (
    <PageHeader className={styles.header} data-testid="calendar-page-header">
      <PageHeaderContent illustration={<AppointmentsPictogram />} title={t('calendar', 'Calendar')} />
      <div className={styles.actions}>
        {filterElement && <div className={styles.filters}>{filterElement}</div>}
        <Button kind="primary" renderIcon={Add} size="md" onClick={() => launchCreateAppointmentForm(t)}>
          {t('newAppointment', 'New appointment')}
        </Button>
      </div>
    </PageHeader>
  );
};

export default CalendarPageHeader;
