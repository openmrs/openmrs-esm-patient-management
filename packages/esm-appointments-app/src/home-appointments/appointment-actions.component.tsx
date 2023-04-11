import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { navigate, useConfig } from '@openmrs/esm-framework';
import { MappedAppointment } from '../types';
import PatientSearch from '../patient-search/patient-search.component';
import { launchOverlay } from '../hooks/useOverlay';
import styles from './appointments-list.scss';
import { spaBasePath } from '../constants';
import { launchCheckInAppointmentModal, handleUpdateStatus, handleComplete } from './common';
import { useSWRConfig } from 'swr';
import CancelAppointment from '../appointments/forms/cancel-form/cancel-appointment.component';
import AppointmentForm from '../appointments/forms/create-edit-form/appointments-form.component';

interface ActionMenuProps {
  appointment: MappedAppointment;
  useBahmniUI?: string;
  mutate?: () => void;
}

export const ActionsMenu = ({ appointment, useBahmniUI }: ActionMenuProps) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const { bahmniAppointmentsUiBaseUrl } = useConfig();

  const { status } = appointment;
  const disableActions = status === 'Completed' || status === 'Missed' || status === 'Cancelled';
  const isScheduled = status === 'Scheduled' || status === 'Requested';

  const onMissed = () => {
    const successDescription = t('appointmentMarkedAsMissed', 'It has been successfully marked as Missed');
    const successTitle = t('appointmentMissed', 'Appointment Missed');
    const errorDescription = t('appointmentMissed', 'Appointment Missed');
    const errorTitle = t('appointmentMissedError', 'Error marking appointment as Missed');
    return handleUpdateStatus(
      'Missed',
      appointment.id,
      successDescription,
      errorDescription,
      successTitle,
      errorTitle,
      mutate,
      t,
    );
  };

  const EditOverflowItem = () =>
    useBahmniUI ? (
      <OverflowMenuItem
        className={styles.menuItemLink}
        id="#editAppointment"
        target="_blank"
        href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/calendar/${appointment.id}?isRecurring=${appointment.recurring}`}
        itemText={t('editAppointment', 'Edit Appointment')}>
        {t('editAppointment', 'Edit Appointment')}
      </OverflowMenuItem>
    ) : (
      <OverflowMenuItem
        className={styles.menuItem}
        id="#editAppointment"
        onClick={() => {
          navigate({ to: `${spaBasePath}` });
          launchOverlay(
            t('editAppointment', 'Edit Appointment'),
            <AppointmentForm appointment={appointment} context="editing" />,
          );
        }}
        itemText={t('editAppointment', 'Edit Appointment')}>
        {t('editAppointment', 'Edit Appointment')}
      </OverflowMenuItem>
    );

  const AddOverflowItem = () =>
    useBahmniUI ? (
      <OverflowMenuItem
        className={styles.menuItemLink}
        id="#createAppointment"
        target="_blank"
        href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/calendar/new`}
        itemText={t('addNewAppointment', 'Add new appointment')}>
        {t('addNewAppointment', 'Add new appointment')}
      </OverflowMenuItem>
    ) : (
      <OverflowMenuItem
        className={styles.menuItem}
        id="#createAppointment"
        onClick={() => {
          navigate({ to: `${spaBasePath}` });
          launchOverlay(t('search', 'Search'), <PatientSearch />);
        }}
        itemText={t('addNewAppointment', 'Add new appointment')}>
        {t('addNewAppointment', 'Add new appointment')}
      </OverflowMenuItem>
    );

  return (
    <Layer>
      <OverflowMenu ariaLabel="Edit appointment" selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
        <EditOverflowItem />
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={status === 'CheckedIn' || disableActions}
          id="#checkInAppointment"
          onClick={() => launchCheckInAppointmentModal(appointment.id)}
          itemText={t('checkIn', 'Check In')}>
          {t('checkIn', 'Check In')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#completeAppointment"
          disabled={isScheduled || disableActions}
          onClick={() => handleComplete(appointment.id, mutate, t)}
          itemText={t('complete', 'Complete')}>
          {t('complete', 'Complete')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          disabled={disableActions}
          id="#missedAppointment"
          onClick={onMissed}
          itemText={t('missed', 'Missed')}>
          {t('missed', 'Missed')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#cancelAppointment"
          disabled={disableActions}
          onClick={() => {
            navigate({ to: `${spaBasePath}` });
            launchOverlay(
              t('cancelAppointment', 'Cancel Appointment'),
              <CancelAppointment appointment={appointment} />,
            );
          }}
          itemText={t('cancel', 'Cancel')}>
          {t('cancel', 'Cancel')}
        </OverflowMenuItem>
        <AddOverflowItem />
      </OverflowMenu>
    </Layer>
  );
};
