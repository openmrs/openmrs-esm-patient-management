import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { age, formatDate, navigate, parseDate, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { serveQueueEntry, updateQueueEntry } from '../active-visits/active-visits-table.resource';
import { getGender } from '../helpers/functions';
import styles from './serve-patient-modal.scss';
import { useMutateQueueEntries } from '../hooks/useMutateQueueEntries';
import { type ConfigObject } from '../config-schema';
import { Tag } from '@carbon/react';

interface TransitionQueueEntryModalProps {
  queueEntry: Record<string, any>;
  closeModal: () => void;
}

const TransitionQueueEntryModal: React.FC<TransitionQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const { queue, visit, uuid, patient, priority, sortWeight } = queueEntry;
  const config = useConfig<ConfigObject>();
  const defaultTransitionStatus = config.concepts.defaultTransitionStatus;
  const { mutateQueueEntries } = useMutateQueueEntries();

  const launchEditPriorityModal = useCallback(() => {
    const endedAt = new Date();
    updateQueueEntry(
      visit?.uuid,
      queue?.uuid,
      queue?.uuid,
      uuid,
      patient?.uuid,
      priority?.uuid,
      defaultTransitionStatus,
      endedAt,
      sortWeight,
    ).then(
      ({ status }) => {
        if (status === 201) {
          serveQueueEntry(queueEntry?.queue.name, queueEntry?.visitQueueNumber, 'serving').then(({ status }) => {
            if (status === 200) {
              showSnackbar({
                isLowContrast: true,
                title: t('success', 'Success'),
                kind: 'success',
                subtitle: t('patientAttendingService', 'Patient attending service'),
              });
              closeModal();
              mutateQueueEntries();
              navigate({ to: `\${openmrsSpaBase}/patient/${patient?.uuid}/chart` });
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

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('servePatient', 'Serve patient')} />
      <ModalBody className={styles.modalBody}>
        <div>
          <section className={styles.modalBody}>
            <span className={styles.patientName}>{patient?.person?.preferredName?.display}</span>
            <div className={styles.demographics}>
              <span>{getGender(patient?.person.gender, t)}</span> &middot;{' '}
              <span>{patient?.person?.birthdate && age(patient?.person?.birthdate)}</span> &middot;{' '}
              <span>
                {patient?.person?.birthdate &&
                  formatDate(parseDate(patient?.person?.birthdate), { mode: 'wide', time: false })}
              </span>
            </div>
            {patient.identifiers?.map((identifier) => <Tag key={identifier.uuid}>{identifier.display}</Tag>)}
          </section>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={() => closeModal()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={() => launchEditPriorityModal()}>{t('serve', 'Serve')}</Button>
      </ModalFooter>
    </div>
  );
};

export default TransitionQueueEntryModal;
