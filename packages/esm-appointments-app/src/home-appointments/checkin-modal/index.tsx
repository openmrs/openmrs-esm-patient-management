import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Button, ModalBody, ModalFooter, ModalHeader, TimePicker } from '@carbon/react';
import { showNotification, showActionableNotification } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { updateAppointmentStatus } from '../appointments-table.resource';
import { handleUndoAction } from '../common';
import { useSWRConfig } from 'swr';

import styles from './index.scss';

interface ChangeStatusDialogProps {
  closeCheckInModal: () => void;
  appointmentUuid: string;
}

const CheckInAppointmentModal: React.FC<ChangeStatusDialogProps> = ({ closeCheckInModal, appointmentUuid }) => {
  const { t } = useTranslation();
  const [checkInTime, setCheckInTime] = useState(dayjs(new Date()).format('hh:mm'));
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const abortController = new AbortController();
    setIsSubmitting(true);
    const { status } = await updateAppointmentStatus('CheckedIn', appointmentUuid);
    if (status === 200) {
      closeCheckInModal();
      showActionableNotification({
        critical: true,
        kind: 'success',
        actionButtonLabel: t('undo', 'Undo'),
        progressActionLabel: t('revertingAppointmentStatus', 'Reverting appointment status'),
        onActionButtonClick: () => handleUndoAction(appointmentUuid, mutate),
        subtitle: t('appointmentSuccessfullyCheckedIn', 'It has been checked-in successfully'),
        title: t('appointmentCheckedIn', 'Appointment Checked-in'),
      });
      mutate(`/ws/rest/v1/appointment/appointment/all`);
    } else {
      showNotification({
        title: t('appointmentCheckInError', 'Error checking in appointment'),
        kind: 'error',
        critical: true,
        description: t('errorMessage', 'Error checking in the appointment'),
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ModalHeader
        closeModal={closeCheckInModal}
        title={t('checkInAppointment', 'Are you sure, you want to mark appointment as Checked-in?')}
      />
      <ModalBody>
        <div className={styles.checkInTime}>
          <span className={styles.checkInLabel}>{t('checkinTime', 'Check-in time')}:</span>
          <TimePicker
            required
            light
            className={styles.timePickerInput}
            pattern="([\d]+:[\d]{2})"
            onChange={(event) => setCheckInTime(event.target.value)}
            value={checkInTime}
            id="end-time-picker"></TimePicker>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeCheckInModal}>
          {t('no', 'No')}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {t('yes', 'Yes')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default CheckInAppointmentModal;
