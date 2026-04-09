import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Appointment } from '../../types';
import { navigate, useConfig, launchWorkspace2, showSnackbar } from '@openmrs/esm-framework';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';
import { useMutateAppointments } from '../../hooks/useMutateAppointments';
import { type ConfigObject } from '../../config-schema';

interface CheckInButtonProps {
  patientUuid: string;
  appointment: Appointment;
  hasActiveVisit?: boolean;
  mutateVisits: () => void;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({ appointment, patientUuid, hasActiveVisit, mutateVisits }) => {
  const { checkInButton } = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const { mutateAppointments } = useMutateAppointments();

  return (
    <Button
      size="sm"
      kind="tertiary"
      onClick={() => {
        // customUrl always takes priority — operator-configured override for entire check-in flow
        if (checkInButton.customUrl) {
          navigate({
            to: checkInButton.customUrl,
            templateParams: { patientUuid: appointment.patient.uuid, appointmentUuid: appointment.uuid },
          });
          return;
        }

        // Patient already has an active visit — only update appointment status, do not start a new visit
        if (hasActiveVisit) {
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
                  t('appointmentCheckInFailed', 'An error occurred while checking in the appointment'),
                kind: 'error',
                isLowContrast: false,
              });
            });
          return;
        }

        // No active visit, no customUrl — launch default start visit workspace
        launchWorkspace2('appointments-start-visit-workspace', {
          patientUuid,
          showPatientHeader: true,
          openedFrom: 'appointments-check-in',
          onVisitStarted: mutateVisits,
        });
      }}>
      {t('checkIn', 'Check in')}
    </Button>
  );
};

export default CheckInButton;
