import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag, ButtonSkeleton } from '@carbon/react';
import { navigate, type Workspace2DefinitionProps, type Visit } from '@openmrs/esm-framework';
import { Calendar } from '@carbon/react/icons';
import dayjs from 'dayjs';
import { usePatientAppointments } from '../patient-appointments/patient-appointments.resource';
import { appointmentsFormWorkspace } from '../constants';
import styles from './create-appointment-from-search-button.scss';

interface CreateAppointmentFromSearchButtonProps {
  patientUuid: string;
  activeVisit?: Visit;
  launchChildWorkspace?: Workspace2DefinitionProps['launchChildWorkspace'];
  closeWorkspace?: Workspace2DefinitionProps['closeWorkspace'];
}

const CreateAppointmentFromSearchButton: React.FC<CreateAppointmentFromSearchButtonProps> = ({
  patientUuid,
  launchChildWorkspace,
}) => {
  const { t } = useTranslation();
  const startDate = useMemo(() => dayjs().startOf('day').toISOString(), []);

  const ac = useMemo<AbortController>(() => new AbortController(), []);
  useEffect(() => () => ac.abort(), [ac]);

  const { data: appointmentsData, isLoading } = usePatientAppointments(patientUuid, startDate, ac);

  // Filter today's appointments to only include those that are happening now or in the future
  const todaysAppointments = appointmentsData?.todaysAppointments?.length
    ? appointmentsData.todaysAppointments.filter((apt) => dayjs(apt.startDateTime).isAfter(dayjs()))
    : [];
  const futureAppointments = appointmentsData?.upcomingAppointments?.length
    ? appointmentsData?.upcomingAppointments
    : [];

  const upcomingAppointmentsCount = todaysAppointments.length + futureAppointments.length;

  const handleCreateAppointment = () => {
    if (launchChildWorkspace) {
      launchChildWorkspace(appointmentsFormWorkspace, { patientUuid });
    } else {
      console.warn('launchChildWorkspace is not provided by the slot context');
    }
  };

  const handleViewUpcoming = () => {
    navigate({ to: `${window.spaBase}/patient/${patientUuid}/chart/Appointments` });
  };

  return (
    <div className={styles.actionContainer}>
      {upcomingAppointmentsCount > 0 && (
        <Tag className={styles.upcomingAppointmentsTag} type="green" renderIcon={Calendar} onClick={handleViewUpcoming}>
          {t('upcomingAppointmentsCount', '{{count}} upcoming', { count: upcomingAppointmentsCount })}
        </Tag>
      )}
      <Button
        aria-label={t('schedule', 'Schedule')}
        className={styles.createButton}
        kind="primary"
        size="sm"
        onClick={handleCreateAppointment}>
        {t('schedule', 'Schedule')}
      </Button>
    </div>
  );
};

export default CreateAppointmentFromSearchButton;
