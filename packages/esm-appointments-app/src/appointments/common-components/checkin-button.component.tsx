import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Appointment } from '../../types';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
import { navigate, useConfig, launchWorkspace2, showSnackbar } from '@openmrs/esm-framework';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';
import { type ConfigObject } from '../../config-schema';
dayjs.extend(utc);
dayjs.extend(isToday);

interface CheckInButtonProps {
  patientUuid: string;
  appointment: Appointment;
  hasActiveVisit?: boolean;
  mutateAppointments?: () => void;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({
  appointment,
  patientUuid,
  hasActiveVisit,
  mutateAppointments,
}) => {
  const { checkInButton } = useConfig<ConfigObject>();
  const { t } = useTranslation();
  return (
    <>
      {checkInButton.enabled &&
        (dayjs(appointment.startDateTime).isAfter(dayjs()) || dayjs(appointment.startDateTime).isToday()) && (
          <Button
            size="sm"
            kind="tertiary"
            onClick={() => {
              if (hasActiveVisit) {
                // Patient already has an active visit — only update appointment status, do not start a new visit
                changeAppointmentStatus('CheckedIn', appointment.uuid)
                  .then(() => {
                    showSnackbar({
                      title: t('checkedIn', 'Checked in'),
                      subtitle: t(
                        'appointmentCheckedInWithExistingVisit',
                        'Appointment checked in using existing active visit',
                      ),
                      kind: 'success',
                      isLowContrast: true,
                    });
                    mutateAppointments?.();
                  })
                  .catch((error) => {
                    console.error('Check-in failed:', error);
                    showSnackbar({
                      title: t('checkInFailed', 'Check-in failed'),
                      subtitle:
                        error?.message ??
                        t(
                          'appointmentCheckInFailed',
                          'An error occurred while checking in the appointment',
                        ),
                      kind: 'error',
                      isLowContrast: false,
                    });
                  });
                return;
              }

              // No active visit — existing behavior
              if (checkInButton.customUrl) {
                navigate({
                  to: checkInButton.customUrl,
                  templateParams: { patientUuid: appointment.patient.uuid, appointmentUuid: appointment.uuid },
                });
              } else {
                launchWorkspace2('appointments-start-visit-workspace', {
                  patientUuid: patientUuid,
                  showPatientHeader: true,
                  openedFrom: 'appointments-check-in',
                });
              }
            }}>
            {t('checkIn', 'Check in')}
          </Button>
        )}
    </>
  );
};

export default CheckInButton;
