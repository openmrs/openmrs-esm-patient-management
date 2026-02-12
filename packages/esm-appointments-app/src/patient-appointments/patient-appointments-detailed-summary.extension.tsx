import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, DataTableSkeleton, InlineLoading, Layer, Switch, Tile } from '@carbon/react';
import {
  AddIcon,
  CardHeader,
  EmptyCardIllustration,
  ErrorCard,
  launchWorkspace2,
  useLayoutType,
} from '@openmrs/esm-framework';
import { type Appointment } from '../types';
import { usePatientAppointments } from './patient-appointments.resource';
import PatientAppointmentsTable from './patient-appointments-table.component';
import styles from './patient-appointments-detailed-summary.scss';

interface PatientAppointmentsDetailProps {
  patientUuid: string;

  /**
   * Optional callback to launch the appropriate appointments form workspace, depending
   * on which app is using this extension. If not provided, uses the default implementation
   * for patient chart context.
   */
  launchAppointmentForm?(patientUuid: string, appointment?: Appointment): void;
}

enum AppointmentTypes {
  UPCOMING = 0,
  TODAY = 1,
  PAST = 2,
}

/**
 * This extension displays a detailed summary of appointments for a single patient.
 * Note that this extension can be used both in the patient chart and in the appointments app.
 * Accordingly, the `launchAppointmentForm` callback is passed in to allow the app to define
 * how the appointments form workspace is launched.
 */
const PatientAppointmentsDetailedSummary: React.FC<PatientAppointmentsDetailProps> = ({
  patientUuid,
  launchAppointmentForm,
}) => {
  const { t } = useTranslation();
  const headerTitle = t('appointments', 'Appointments');
  const isTablet = useLayoutType() === 'tablet';
  const [switchedView, setSwitchedView] = useState(false);

  // Default implementation for patient chart context
  const defaultLaunchAppointmentForm = (patientUuid: string, appointment?: Appointment) => {
    launchWorkspace2('appointments-form-workspace', { patientUuid, appointment });
  };

  const handleLaunchAppointmentForm = launchAppointmentForm || defaultLaunchAppointmentForm;

  const [contentSwitcherValue, setContentSwitcherValue] = useState(0);
  const startDate = useMemo(() => dayjs().subtract(6, 'month').toISOString(), []);
  const {
    data: appointmentsData,
    error,
    isLoading,
    isValidating,
  } = usePatientAppointments(
    patientUuid,
    startDate,
    useMemo(() => new AbortController(), []),
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
  }

  if (error) {
    return <ErrorCard headerTitle={headerTitle} error={error} />;
  }

  if (appointmentsData && Object.keys(appointmentsData)?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          {isValidating ? (
            <span>
              <InlineLoading />
            </span>
          ) : null}
          <div className={styles.contentSwitcherWrapper}>
            <ContentSwitcher
              size={isTablet ? 'md' : 'sm'}
              selectedIndex={contentSwitcherValue}
              onChange={({ index }) => {
                setContentSwitcherValue(index);
                setSwitchedView(true);
              }}>
              <Switch name={'upcoming'}>{t('upcoming', 'Upcoming')}</Switch>
              <Switch name={'today'}>{t('today', 'Today')}</Switch>
              <Switch name={'past'}>{t('past', 'Past')}</Switch>
            </ContentSwitcher>
            <div className={styles.divider}>|</div>
            <Button
              kind="ghost"
              renderIcon={(props) => <AddIcon size={16} {...props} />}
              iconDescription="Add Appointments"
              onClick={() => handleLaunchAppointmentForm(patientUuid)}>
              {t('add', 'Add')}
            </Button>
          </div>
        </CardHeader>
        {(() => {
          if (contentSwitcherValue === AppointmentTypes.UPCOMING) {
            if (appointmentsData.upcomingAppointments?.length) {
              return (
                <PatientAppointmentsTable
                  patientAppointments={appointmentsData?.upcomingAppointments}
                  switchedView={switchedView}
                  setSwitchedView={setSwitchedView}
                  patientUuid={patientUuid}
                />
              );
            }
            return (
              <Layer>
                <Tile className={styles.tile}>
                  <EmptyCardIllustration />
                  <p className={styles.content}>
                    {t(
                      'noUpcomingAppointmentsForPatient',
                      'There are no upcoming appointments to display for this patient',
                    )}
                  </p>
                </Tile>
              </Layer>
            );
          }

          if (contentSwitcherValue === AppointmentTypes.TODAY) {
            if (appointmentsData.todaysAppointments?.length) {
              return (
                <PatientAppointmentsTable
                  patientAppointments={appointmentsData?.todaysAppointments}
                  switchedView={switchedView}
                  setSwitchedView={setSwitchedView}
                  patientUuid={patientUuid}
                />
              );
            }
            return (
              <Layer>
                <Tile className={styles.tile}>
                  <EmptyCardIllustration />
                  <p className={styles.content}>
                    {t(
                      'noCurrentAppointments',
                      'There are no appointments scheduled for today to display for this patient',
                    )}
                  </p>
                </Tile>
              </Layer>
            );
          }

          if (contentSwitcherValue === AppointmentTypes.PAST) {
            if (appointmentsData.pastAppointments?.length) {
              return (
                <PatientAppointmentsTable
                  patientAppointments={appointmentsData?.pastAppointments}
                  switchedView={switchedView}
                  setSwitchedView={setSwitchedView}
                  patientUuid={patientUuid}
                />
              );
            }
            return (
              <Layer>
                <Tile className={styles.tile}>
                  <EmptyCardIllustration />
                  <p className={styles.content}>
                    {t('noPastAppointments', 'There are no past appointments to display for this patient')}
                  </p>
                </Tile>
              </Layer>
            );
          }
        })()}
      </div>
    );
  }
};

export default PatientAppointmentsDetailedSummary;
