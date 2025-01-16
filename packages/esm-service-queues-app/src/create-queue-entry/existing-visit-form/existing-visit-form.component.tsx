import { Button, ButtonSet, Form, Row } from '@carbon/react';
import { ExtensionSlot, useLayoutType, type Visit } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import QueueFields from '../queue-fields/queue-fields.component';
import styles from './existing-visit-form.scss';

interface ExistingVisitFormProps {
  closeWorkspace: () => void;
  visit: Visit;
}

/**
 * This is the form that appears when clicking on a search result in the "Add patient to queue" workspace,
 * when the patient already has an active visit.
 */
const ExistingVisitForm: React.FC<ExistingVisitFormProps> = ({ visit, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateQueueEntries } = useMutateQueueEntries();
  const [callback, setCallback] = useState<{
    submitQueueEntry: (visit: Visit) => Promise<any>;
  }>(null);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setIsSubmitting(true);

      callback
        ?.submitQueueEntry?.(visit)
        ?.then(() => {
          closeWorkspace();
          mutateQueueEntries();
        })
        ?.finally(() => {
          setIsSubmitting(false);
        });
    },
    [closeWorkspace, callback, visit, mutateQueueEntries],
  );

  return visit ? (
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
      <Form className={classNames(styles.form, styles.container)} onSubmit={handleSubmit}>
        <QueueFields setOnSubmit={(onSubmit) => setCallback({ submitQueueEntry: onSubmit })} />
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
            {t('addPatientToQueue', 'Add patient to queue')}
          </Button>
        </ButtonSet>
      </Form>
    </>
  ) : null;
};

export default ExistingVisitForm;
