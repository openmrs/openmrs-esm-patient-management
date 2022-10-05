import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextArea } from '@carbon/react';
import { useSession, showToast, showNotification, ExtensionSlot, usePatient, parseDate } from '@openmrs/esm-framework';
import { MappedAppointment } from '../types';
import { cancelAppointment } from './appointment-forms.resource';
import { closeOverlay } from '../hooks/useOverlay';
import styles from './cancel-appointment.scss';
import { useSWRConfig } from 'swr';
import { useAppointmentDate } from '../helpers';

interface CancelAppointmentProps {
  appointment: MappedAppointment;
}
const CancelAppointment: React.FC<CancelAppointmentProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const { patient } = usePatient(appointment.patientUuid);
  const session = useSession();
  const [selectedLocation, setSelectedLocation] = useState(appointment.location);
  const [reason, setReason] = useState('');
  const startDate = useAppointmentDate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedLocation && session?.sessionLocation?.uuid) {
      setSelectedLocation(session?.sessionLocation?.uuid);
    }
  }, [selectedLocation, session]);

  const handleSubmit = async () => {
    const abortController = new AbortController();
    setIsSubmitting(true);
    const { status } = await cancelAppointment('Cancelled', appointment.id, abortController);
    if (status === 200) {
      showToast({
        critical: true,
        kind: 'success',
        description: t('appointmentNowVisible', 'It has been cancelled successfully'),
        title: t('appointmentCancelled', 'Appointment cancelled'),
      });
      mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${startDate}&status=Scheduled`);
      mutate(`/ws/rest/v1/appointment/appointmentStatus?forDate=${startDate}&status=Cancelled`);
      closeOverlay();
    } else {
      showNotification({
        title: t('appointmentCancelError', 'Error cancelling appointment'),
        kind: 'error',
        critical: true,
        description: t('errorMessage', 'Error cancelling the appointment'),
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {patient && (
        <ExtensionSlot
          extensionSlotName="patient-header-slot"
          state={{
            patient,
            patientUuid: appointment.patientUuid,
          }}
        />
      )}

      <TextArea
        id="reason"
        light
        value={reason}
        className={styles.inputContainer}
        labelText={t('reasonForChanges', 'Reason For Changes')}
        onChange={(event) => setReason(event.target.value)}
      />

      <div className={styles.buttonContainer}>
        <Button onClick={() => closeOverlay()} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} kind="primary" type="submit">
          {t('cancelAppointment', 'Cancel Appointment')}
        </Button>
      </div>
    </div>
  );
};

export default CancelAppointment;
