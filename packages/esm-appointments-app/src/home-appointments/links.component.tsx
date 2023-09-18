import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Add, Calendar } from '@carbon/react/icons';
import { useConfig, navigate } from '@openmrs/esm-framework';
import { launchOverlay } from '../hooks/useOverlay';
import { spaBasePath } from '../constants';
import PatientSearch from '../patient-search/patient-search.component';
import styles from './appointments-list.scss';

const SeeAllAppointmentsLink = () => {
  const { useBahmniAppointmentsUI: useBahmniUI, bahmniAppointmentsUiBaseUrl } = useConfig();

  const { t } = useTranslation();

  return useBahmniUI ? (
    <Button
      kind="ghost"
      className={styles.seeAllLink}
      size="md"
      target="_blank"
      href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/list`}>
      {t('seeAllAppointments', 'See all appointments')}
    </Button>
  ) : (
    <Button kind="ghost" className={styles.seeAllLink} onClick={() => navigate({ to: `${spaBasePath}/appointments` })}>
      {t('seeAllAppointments', 'See all appointments')}
    </Button>
  );
};

const AddAppointmentLink = () => {
  const { useBahmniAppointmentsUI: useBahmniUI, bahmniAppointmentsUiBaseUrl } = useConfig();

  const { t } = useTranslation();

  return (
    <div className={styles.addButtonContainer}>
      {useBahmniUI ? (
        <Button
          target="_blank"
          kind="ghost"
          href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/calendar/new`}
          renderIcon={(props) => <Add size={16} {...props} />}>
          {t('add', 'Add')}
        </Button>
      ) : (
        <Button
          kind="ghost"
          renderIcon={(props) => <Add size={16} {...props} />}
          onClick={() => {
            navigate({ to: `${spaBasePath}/appointments` });
            launchOverlay(t('search', 'Search'), <PatientSearch />);
          }}>
          {t('add', 'Add')}
        </Button>
      )}
    </div>
  );
};

const ViewCalendarLink = () => {
  const { useBahmniAppointmentsUI: useBahmniUI, bahmniAppointmentsUiBaseUrl } = useConfig();

  const { t } = useTranslation();

  return useBahmniUI ? (
    <Button
      className={styles.viewCalendarButton}
      kind="ghost"
      size="md"
      target="_blank"
      href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/calendar`}>
      {t('viewCalendar', 'View Calendar')}
    </Button>
  ) : (
    <Button
      className={styles.viewCalendarButton}
      kind="ghost"
      onClick={() => navigate({ to: `${spaBasePath}/appointments/calendar` })}
      renderIcon={(props) => <Calendar size={16} {...props} />}
      data-floating-menu-primary-focus
      iconDescription={t('viewCalendar', 'View Calendar')}>
      {t('viewCalendar', 'View Calendar')}
    </Button>
  );
};

export { SeeAllAppointmentsLink, AddAppointmentLink, ViewCalendarLink };
