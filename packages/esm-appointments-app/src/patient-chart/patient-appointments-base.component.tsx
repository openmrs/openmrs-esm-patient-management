import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Button, DataTableSkeleton, ContentSwitcher, InlineLoading, Layer, Switch, Tile } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { usePatientAppointments } from './patient-appointments.resource';
import PatientAppointmentsTable from './patient-appointments-table';
import styles from './patient-appointments-base.scss';

interface PatientAppointmentsBaseProps {
  basePath?: string;
  patientUuid: string;
}

enum AppointmentTypes {
  UPCOMING = 0,
  TODAY = 1,
  PAST = 2,
}

const PatientAppointmentsBase: React.FC<PatientAppointmentsBaseProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('appointments', 'Appointments');
  const isTablet = useLayoutType() === 'tablet';

  const [switchedView, setSwitchedView] = useState(false);

  const [contentSwitcherValue, setContentSwitcherValue] = useState(0);
  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const {
    data: appointmentsData,
    isError,
    isLoading,
    isValidating,
  } = usePatientAppointments(patientUuid, startDate, new AbortController());

  const launchAppointmentsForm = () => launchPatientWorkspace('appointments-form-workspace');

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
  if (isError) {
    return <ErrorState headerTitle={headerTitle} error={isError} />;
  }
  if (Object.keys(appointmentsData)?.length) {
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
              onChange={({ index }) => {
                setContentSwitcherValue(index);
                setSwitchedView(true);
              }}>
              <Switch name={'upcoming'} text={t('upcoming', 'Upcoming')} />
              <Switch name={'today'} text={t('today', 'Today')} />
              <Switch name={'past'} text={t('past', 'Past')} />
            </ContentSwitcher>
            <div className={styles.divider}>|</div>
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              iconDescription="Add Appointments"
              onClick={launchAppointmentsForm}>
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
                  <EmptyDataIllustration />
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
                  <EmptyDataIllustration />
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
                  <EmptyDataIllustration />
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

export default PatientAppointmentsBase;
