import React, { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Button,
  Dropdown,
  InlineLoading,
  InlineNotification,
  Layer,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
} from '@carbon/react';
import {
  getCoreTranslation,
  isDesktop,
  showSnackbar,
  updateVisit,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import { canTransition } from '../../helpers';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';
import { getActiveVisitsForPatient } from './batch-change-appointment-statuses.resources';
import { type Appointment, AppointmentStatus } from '../../types';
import { type ConfigObject } from '../../config-schema';
import { useMutateAppointments } from '../../form/appointments-form.resource';
import styles from './batch-change-appointment-statuses.scss';

interface BatchChangeAppointmentStatusesModalProps {
  appointments: Array<Appointment>;
  closeModal: () => void;
}

/**
 * This modal appears when selecting one or more rows in the appointments table and clicking "Change status",
 * to allow the user to change the status of multiple appointments.
 *
 * Note:
 * - The "CheckedIn" status is not available as selection as it requires filling out a form for each patient
 * - The "Completed" status is only available as selection if the config value `checkOutButton.enabled` is true.
 */
const BatchChangeAppointmentStatusesModal: React.FC<BatchChangeAppointmentStatusesModalProps> = ({
  appointments,
  closeModal,
}) => {
  const { t } = useTranslation();
  const { mutateAppointments } = useMutateAppointments();
  const isTablet = !isDesktop(useLayoutType());
  const [status, setStatus] = useState<AppointmentStatus>();
  const { checkOutButton } = useConfig<ConfigObject>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const invalidAppointment =
    status != null ? appointments.find((a) => a.status !== status && !canTransition(a.status, status)) : undefined;

  const submit = useCallback(() => {
    const updateAppointment = (appointment: Appointment) => {
      // server throws an exception if we make a call to change the appointment status to its current
      // status, so we just do nothing if that's the case
      if (status === appointment.status) {
        return Promise.resolve();
      }

      return changeAppointmentStatus(status, appointment.uuid).then((res) => {
        if (status === AppointmentStatus.COMPLETED) {
          return getActiveVisitsForPatient(appointment.patient.uuid)
            .then((response) => {
              const activeVisit = response.data.results?.[0];
              if (activeVisit) {
                const abortController = new AbortController();
                const endVisitPayload = { stopDatetime: new Date() };

                return updateVisit(activeVisit.uuid, endVisitPayload, abortController);
              }
            })
            .catch(() => {
              showSnackbar({
                title: t('failedToUpdateVisit', 'Failed to update visit'),
                subtitle: t('failedToEndActiveVisit', 'Failed to end active visit for {{patient}}', {
                  patient: appointment.patient.name,
                }),
              });
              return res;
            });
        } else {
          return res;
        }
      });
    };

    setIsSubmitting(true);
    Promise.allSettled(appointments.map(updateAppointment))
      .then(async (results) => {
        const hasFailedResults = results.some((result) => result.status == 'rejected');
        if (hasFailedResults) {
          for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === 'rejected') {
              const errorResponse = await result.reason.response.json();
              const appointment = appointments[i];

              showSnackbar({
                title: t('appointmentsUpdateFailed', 'Appointments update failed'),
                kind: 'error',
                subtitle: (
                  <div>
                    {t(
                      'appointmentsUpdateFailedMessage',
                      'Appointments update failed for {{patient}}. Reason: {{reason}}',
                      {
                        patient: appointment.patient.name,
                        reason: errorResponse.error.translatedMessage,
                      },
                    )}
                  </div>
                ),
              });
            }
          }
        } else {
          showSnackbar({
            title: t('appointmentsUpdated', 'Appointments updated'),
            subtitle: t(
              'appointmentsUpdatedMessage',
              'Appointments for selected patients have been successfully updated',
            ),
          });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
        mutateAppointments();
        closeModal();
      });
  }, [status, appointments, closeModal, mutateAppointments, t]);

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('changeAppointmentsStatus', 'Change appointments status')} />
      <ModalBody className={styles.modalBody}>
        <Stack gap={5}>
          <p>{t('changeStatusForSelectedAppointments', 'Change the status for the following appointments.')}</p>
          <ul className={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <li key={appointment.patient.uuid}>
                <Trans i18nKey="appointmentDisplay">
                  <strong>{{ patientName: appointment.patient.name } as any}</strong> -{' '}
                  {{ serviceName: appointment.service.name } as any} - {{ currentStatus: appointment.status } as any}
                </Trans>
              </li>
            ))}
          </ul>
          <Layer>
            <Dropdown
              id={'statusDropdown'}
              className={styles.statusDropdown}
              label={t('selectStatus', 'Select status')}
              titleText={''}
              type="inline"
              items={[
                { id: AppointmentStatus.SCHEDULED, label: t('scheduled', 'Scheduled') },
                { id: AppointmentStatus.CANCELLED, label: t('cancelled', 'Cancelled') },
                { id: AppointmentStatus.MISSED, label: t('missed', 'Missed') },
                ...(checkOutButton.enabled
                  ? [{ id: AppointmentStatus.COMPLETED, label: t('completed', 'Completed') }]
                  : []),
              ]}
              itemToString={(item) => (item ? item.label : '')}
              onChange={(e) => setStatus(e.selectedItem.id)}
              size={isTablet ? 'lg' : 'sm'}
            />
          </Layer>
          {status === AppointmentStatus.COMPLETED && (
            <InlineNotification
              kind="warning"
              lowContrast
              hideCloseButton
              title={t(
                'markAppointmentAsCompletedMessage',
                'Marking appointment as completed will end the active visit of the patient',
              )}
            />
          )}
          {status && invalidAppointment && (
            <InlineNotification
              kind="warning"
              lowContrast
              hideCloseButton
              title={t(
                'invalidAppointmentStatusChange',
                'Cannot transition appointment with status {{currentStatus}} to status {{newStatus}}',
                {
                  currentStatus: invalidAppointment.status,
                  newStatus: status,
                },
              )}
            />
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button kind="primary" disabled={isSubmitting || invalidAppointment != null || status == null} onClick={submit}>
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} />
          ) : (
            <span>{t('saveAndClose', 'Save and close')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default BatchChangeAppointmentStatusesModal;
