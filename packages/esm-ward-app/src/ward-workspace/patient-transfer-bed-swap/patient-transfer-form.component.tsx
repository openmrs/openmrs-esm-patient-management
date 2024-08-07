import React from 'react';
import { type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import type { PatientTransferAndSwapWorkspaceProps } from './types';
import styles from './patient-transfer-swap.scss';
import { Form, ButtonSet, Button } from '@carbon/react';

export default function PatientTransferForm(props: PatientTransferAndSwapWorkspaceProps) {
  return (
    <Form className={styles.formContainer}>
      <div>A</div>
      <ButtonSet className={styles.buttonSet}>
        <Button size="xl" kind="secondary">
          Cancel
        </Button>
        <Button size="xl">Save</Button>
      </ButtonSet>
    </Form>
  );
}
