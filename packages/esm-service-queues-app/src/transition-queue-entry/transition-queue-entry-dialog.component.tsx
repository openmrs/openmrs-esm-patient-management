import React, { useCallback } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import {
  type ConfigObject,
  ExtensionSlot,
  formatDatetime,
  navigate,
  parseDate,
  showSnackbar,
  toDateObjectStrict,
  toOmrsIsoString,
  useConfig,
} from '@openmrs/esm-framework';
import {
  type MappedVisitQueueEntry,
  serveQueueEntry,
  updateQueueEntry,
  useVisitQueueEntries,
} from '../active-visits/active-visits-table.resource';
import { findObsByConceptUUID } from '../helpers/functions';
import { requeueQueueEntry } from './transition-queue-entry.resource';
import { usePastVisits } from '../past-visit/past-visit.resource';
import { usePatientAppointments } from '../queue-patient-linelists/queue-linelist.resource';
import styles from './transition-queue-entry-dialog.scss';

interface TransitionQueueEntryModalProps {
  queueEntry: MappedVisitQueueEntry;
  closeModal: () => void;
}

enum priorityComment {
  REQUEUED = 'Requeued',
}

const TransitionQueueEntryModal: React.FC<TransitionQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const config = useConfig() as ConfigObject;
  const defaultTransitionStatus = config.concepts.defaultTransitionStatus;

  const preferredIdentifiers = queueEntry?.identifiers.filter((identifier) =>
    config.defaultIdentifierTypes.includes(identifier?.identifierType?.uuid),
  );

  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const { upcomingAppointment, isLoading } = usePatientAppointments(queueEntry?.patientUuid, startDate);
  const { visits, isLoading: loading } = usePastVisits(queueEntry?.patientUuid);
  const obsToDisplay =
    !loading && visits ? findObsByConceptUUID(visits?.encounters, config.concepts.historicalObsConceptUuid) : [];
  const { mutate } = useVisitQueueEntries('', '');

  const launchEditPriorityModal = useCallback(() => {
    const endedAt = new Date();
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
    ).then(
      ({ status }) => {
        if (status === 201) {
          serveQueueEntry(queueEntry?.service, queueEntry?.visitQueueNumber, 'serving').then(({ status }) => {
            if (status === 200) {
              showSnackbar({
                isLowContrast: true,
                title: t('success', 'Success'),
                kind: 'success',
                subtitle: t('patientAttendingService', 'Patient attending service'),
              });
              closeModal();
              mutate();
              navigate({ to: `\${openmrsSpaBase}/patient/${queueEntry?.patientUuid}/chart` });
            }
          });
        }
      },
      (error) => {
        showSnackbar({
          title: t('queueEntryUpdateFailed', 'Error updating queue entry'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      },
    );
  }, [queueEntry]);

  const handleRequeuePatient = useCallback(() => {
    requeueQueueEntry(priorityComment.REQUEUED, queueEntry?.queueUuid, queueEntry?.queueEntryUuid).then(
      ({ status }) => {
        if (status === 200) {
          showSnackbar({
            isLowContrast: true,
            title: t('success', 'Success'),
            kind: 'success',
            subtitle: t('patientRequeued', 'Patient has been requeued'),
          });
          closeModal();
          mutate();
        }
      },
      (error) => {
        showSnackbar({
          title: t('queueEntryUpdateFailed', 'Error updating queue entry'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      },
    );
  }, []);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('servePatient', 'Serve patient')} />
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
            {obsToDisplay?.length
              ? obsToDisplay.map((o) => (
                  <p className={styles.p}>
                    {o.concept.display} : &nbsp; {o.value.display}
                  </p>
                ))
              : ''}
            <p className={styles.p}>
              {t('tcaDate', 'Tca date')} : &nbsp; {isLoading && t('loading', 'Loading...')}
              {!isLoading && !upcomingAppointment && t('none', 'None')}
              {upcomingAppointment && formatDatetime(parseDate(upcomingAppointment?.startDateTime))}
            </p>
          </section>
          <ExtensionSlot
            className={styles.visitSummaryContainer}
            name="previous-visit-summary-slot"
            state={{
              patientUuid: queueEntry?.patientUuid,
            }}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={() => handleRequeuePatient()}>
          {t('requeue', 'Requeue')}
        </Button>
        <Button onClick={() => launchEditPriorityModal()}>{t('serve', 'Serve')}</Button>
      </ModalFooter>
    </div>
  );
};

export default TransitionQueueEntryModal;
