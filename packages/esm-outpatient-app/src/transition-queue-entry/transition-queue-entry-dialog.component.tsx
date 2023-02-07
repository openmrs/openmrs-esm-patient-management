import React, { useCallback } from 'react';
import { MappedVisitQueueEntry, updateQueueEntry } from '../active-visits/active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import {
  ConfigObject,
  ExtensionSlot,
  formatDatetime,
  navigate,
  parseDate,
  showNotification,
  showToast,
  toDateObjectStrict,
  toOmrsIsoString,
  useConfig,
} from '@openmrs/esm-framework';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { mutate } from 'swr';
import styles from './transition-queue-entry-dialog.scss';
import dayjs from 'dayjs';
import { usePatientAppointments } from '../queue-patient-linelists/queue-linelist.resource';
import { usePastVisits } from '../past-visit/past-visit.resource';
interface TransitionQueueEntryModalProps {
  queueEntry: MappedVisitQueueEntry;
  closeModal: () => void;
}
const TransitionQueueEntryModal: React.FC<TransitionQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const config = useConfig() as ConfigObject;
  const defaultTransitionStatus = config.concepts.defaultTransitionStatus;

  const preferredIdentifiers = queueEntry?.identifiers.filter((identifier) =>
    config.defaultIdentifierTypes.includes(identifier?.identifierType?.uuid),
  );

  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const { upcomingAppointment, isLoading } = usePatientAppointments(
    queueEntry?.patientUuid,
    startDate,
    new AbortController(),
  );
  const { visits, isLoading: loading } = usePastVisits(queueEntry?.patientUuid);

  const launchEditPriorityModal = useCallback(() => {
    const endedAt = toDateObjectStrict(toOmrsIsoString(new Date()));
    updateQueueEntry(
      queueEntry?.visitUuid,
      queueEntry?.queueUuid,
      queueEntry?.queueUuid,
      queueEntry?.queueEntryUuid,
      queueEntry?.patientUuid,
      queueEntry?.priorityUuid,
      defaultTransitionStatus,
      endedAt,
      queueEntry?.sortWeight,
      new AbortController(),
    ).then(
      ({ status }) => {
        if (status === 201) {
          showToast({
            critical: true,
            title: t('success', 'Success'),
            kind: 'success',
            description: t('patientAttendingService', 'Patient attending service'),
          });
          closeModal();
          mutate(`/ws/rest/v1/visit-queue-entry?location=${queueEntry?.queueLocation}&v=full`);
          navigate({ to: `\${openmrsSpaBase}/patient/${queueEntry?.patientUuid}/chart` });
        }
      },
      (error) => {
        showNotification({
          title: t('queueEntryUpdateFailed', 'Error updating queue entry'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  }, [queueEntry]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('admitPatient', 'Admit patient')} />
      <ModalBody className={styles.modalBody}>
        <div>
          <section className={styles.modalBody}>
            <p className={styles.p}>
              {t('patientName', 'Patient name')} : &nbsp; {queueEntry?.name}
            </p>
            {preferredIdentifiers?.length
              ? preferredIdentifiers.map((identifier) => (
                  <p className={styles.p}>
                    {identifier?.identifierType?.display} : &nbsp; {identifier?.identifier}
                  </p>
                ))
              : ''}
            <p className={styles.p}>
              {t('lastClinicalVisit', 'Last clinical visit')} : &nbsp; {loading && t('loading', 'Loading...')}
              {!loading && !visits && t('none', 'None')}
              {visits && formatDatetime(parseDate(visits?.startDatetime))}
            </p>
            <p className={styles.p}>
              {t('tcaDate', 'Tca date')} : &nbsp; {isLoading && t('loading', 'Loading...')}
              {!isLoading && !upcomingAppointment && t('none', 'None')}
              {upcomingAppointment && formatDatetime(parseDate(upcomingAppointment?.startDateTime))}
            </p>
          </section>
          <ExtensionSlot
            className={styles.visitSummaryContainer}
            extensionSlotName="previous-visit-summary-slot"
            state={{
              patientUuid: queueEntry?.patientUuid,
            }}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('requeue', 'Requeue')}
        </Button>
        <Button onClick={() => launchEditPriorityModal()}>{t('admit', 'Admit')}</Button>
      </ModalFooter>
    </div>
  );
};

export default TransitionQueueEntryModal;
