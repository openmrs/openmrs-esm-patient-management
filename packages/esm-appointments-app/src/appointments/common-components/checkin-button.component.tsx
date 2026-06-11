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

  // Sets the appointment status to CheckedIn and surfaces the outcome to the user.
  const checkIn = (successSubtitle: string) =>
    changeAppointmentStatus('CheckedIn', appointment.uuid)
      .then(() => {
        showSnackbar({
          title: t('checkedIn', 'Checked in'),
          subtitle: successSubtitle,
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
            error?.message ?? t('appointmentCheckInFailed', 'An error occurred while checking in the appointment'),
          kind: 'error',
          isLowContrast: false,
        });
      });

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
          checkIn(t('appointmentCheckedInWithExistingVisit', 'Appointment checked in using existing active visit'));
          return;
        }

        // No active visit, no customUrl — launch the start visit workspace and check the patient in
        // automatically once the visit has been created, so the user doesn't have to click Check in again.
        launchWorkspace2('appointments-start-visit-workspace', {
          patientUuid,
          showPatientHeader: true,
          openedFrom: 'appointments-check-in',
          onVisitStarted: () => {
            mutateVisits();
            checkIn(
              t('appointmentCheckedInAfterVisitStarted', 'The visit was started and the appointment was checked in'),
            );
          },
        });
      }}>
      {t('checkIn', 'Check in')}
    </Button>
  );
};

export default CheckInButton;
