import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Form, Row } from '@carbon/react';
import { ExtensionSlot, useLayoutType, type Visit } from '@openmrs/esm-framework';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import QueueFields from '../queue-fields/queue-fields.component';
import styles from './existing-visit-form.scss';

interface ExistingVisitFormProps {
  closeWorkspace: () => void;
  handleReturnToSearchList?: () => void;
  visit: Visit;
}

/**
 * This is the form that appears when clicking on a search result in the "Add patient to queue" workspace,
 * when the patient already has an active visit.
 */
const ExistingVisitForm: React.FC<ExistingVisitFormProps> = ({ visit, closeWorkspace, handleReturnToSearchList }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateQueueEntries } = useMutateQueueEntries();
  const [callback, setCallback] = useState<{
    submitQueueEntry: (visit: Visit) => Promise<unknown>;
  } | null>(null);

  const handleCloseWorkspace = useCallback(() => {
    if (handleReturnToSearchList) {
      handleReturnToSearchList();
    } else {
      closeWorkspace();
    }
  }, [closeWorkspace, handleReturnToSearchList]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      if (!callback) {
        return;
      }

      setIsSubmitting(true);

      callback
        .submitQueueEntry(visit)
        .then(() => {
          closeWorkspace();
          mutateQueueEntries();
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [closeWorkspace, callback, visit, mutateQueueEntries],
  );

  const handleSetOnSubmit = useCallback((onSubmit: (visit: Visit) => Promise<unknown>) => {
    setCallback({ submitQueueEntry: onSubmit });
  }, []);

  if (!visit) {
    return null;
  }

  return (
    <>
      {isTablet && (
        <Row className={styles.headerGridRow}>
          <ExtensionSlot
            name="visit-form-header-slot"
            className={styles.dataGridRow}
            state={{ patientUuid: visit.patient.uuid }}
          />
        </Row>
      )}
      <Form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.container}>
          <QueueFields setOnSubmit={handleSetOnSubmit} />
        </div>
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={handleCloseWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} disabled={isSubmitting || !callback} kind="primary" type="submit">
            {t('addPatientToQueue', 'Add patient to queue')}
          </Button>
        </ButtonSet>
      </Form>
    </>
  );
};

export default ExistingVisitForm;
