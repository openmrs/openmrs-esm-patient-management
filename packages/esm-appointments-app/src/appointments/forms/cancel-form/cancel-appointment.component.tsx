import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layer, TextArea } from '@carbon/react';
import { useSession, showSnackbar, ExtensionSlot, usePatient, restBaseUrl } from '@openmrs/esm-framework';
import { cancelAppointment } from '../forms.resource';
import { useSWRConfig } from 'swr';
import { closeOverlay } from '../../../hooks/useOverlay';
import styles from './cancel-appointment.scss';
import { type Appointment } from '../../../types';
import { useSelectedDate } from '../../../helpers';

interface CancelAppointmentProps {
  appointment: Appointment;
}
const CancelAppointment: React.FC<CancelAppointmentProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const { patient } = usePatient(appointment.patient.uuid);
  const session = useSession();
  const [selectedLocation, setSelectedLocation] = useState(appointment.location.uuid);
  const [reason, setReason] = useState('');
  const { selectedDate } = useSelectedDate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedLocation && session?.sessionLocation?.uuid) {
      setSelectedLocation(session?.sessionLocation?.uuid);
    }
  }, [selectedLocation, session]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { status } = await cancelAppointment('Cancelled', appointment.uuid);
    if (status === 200) {
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('cancelledSuccessfully', 'It has been cancelled successfully'),
        title: t('appointmentCancelled', 'Appointment cancelled'),
      });
      mutate(`${restBaseUrl}/appointment/appointmentStatus?forDate=${selectedDate}&status=Scheduled`);
      mutate(`${restBaseUrl}/appointment/appointmentStatus?forDate=${selectedDate}&status=Cancelled`);
      closeOverlay();
    } else {
      showSnackbar({
        title: t('appointmentCancelError', 'Error cancelling appointment'),
        kind: 'error',
        subtitle: t('errorCancellingAppointment', 'Error cancelling the appointment'),
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {patient && (
        <ExtensionSlot
          name="patient-header-slot"
          state={{
            patient,
            patientUuid: appointment.patient.uuid,
            hideActionsOverflow: true,
          }}
        />
      )}

      <Layer>
        <TextArea
          id="reason"
          value={reason}
          className={styles.inputContainer}
          labelText={t('reasonForChanges', 'Reason For Changes')}
          onChange={(event) => setReason(event.target.value)}
        />
      </Layer>

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
