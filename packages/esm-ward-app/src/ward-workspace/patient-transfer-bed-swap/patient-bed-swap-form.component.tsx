import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { PatientTransferAndSwapWorkspaceProps } from './types';
import styles from './patient-transfer-swap.scss';
import { Form, ButtonSet, Button } from '@carbon/react';
import { useAdmissionLocation } from '../../hooks/useAdmissionLocation';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup } from '@carbon/react';
import { RadioButton } from '@carbon/react';
import { RadioButtonSkeleton } from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { filterBeds } from '../../ward-view/ward-view.resource';
import type { BedLayout } from '../../types';
import { InlineNotification } from '@carbon/react';

export default function PatientBedSwapForm({
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
}: PatientTransferAndSwapWorkspaceProps) {
  const { t } = useTranslation();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const { isLoading, admissionLocation } = useAdmissionLocation();

  const zodSchema = useMemo(
    () =>
      z.object({
        bedId: z.number({
          required_error: t('pleaseSelectBed', 'Please select a bed'),
        }),
      }),
    [t],
  );

  type FormValues = z.infer<typeof zodSchema>;

  const {
    formState: { errors, isDirty },
    control,
    handleSubmit,
    getValues,
  } = useForm<FormValues>({ resolver: zodResolver(zodSchema) });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
    return () => promptBeforeClosing(null);
  }, [isDirty]);

  const getBedInformation = useCallback(
    (bed: BedLayout) => {
      const patients = bed.patients.map((patient) => patient?.person?.preferredName?.display);
      const bedNumber = bed.bedNumber;
      return [bedNumber, ...(patients.length ? patients : [t('empty', 'Empty')])].join(' · ');
    },
    [t],
  );

  const beds = useMemo(() => (admissionLocation ? filterBeds(admissionLocation) : []), [admissionLocation]);
  const bedDetails = useMemo(
    () => beds.map((bed) => ({ id: bed.bedId, label: getBedInformation(bed) })),
    [beds, getBedInformation],
  );

  const onSubmit = useCallback(
    (values: FormValues) => {
      setShowErrorNotifications(false);
    },
    [setShowErrorNotifications],
  );

  const onError = useCallback(() => {
    setShowErrorNotifications(true);
  }, []);

  return (
    <Form onSubmit={handleSubmit(onSubmit, onError)} className={styles.formContainer}>
      <div>
        <h2 className={styles.productiveHeading02}>{t('selectABed', 'Select a bed')}</h2>
        {isLoading ? (
          <RadioButtonGroup className={styles.radioButtonGroup} name="bedId">
            <RadioButtonSkeleton />
            <RadioButtonSkeleton />
            <RadioButtonSkeleton />
          </RadioButtonGroup>
        ) : (
          <Controller
            name="bedId"
            control={control}
            render={({ field: { onChange, value } }) => (
              <RadioButtonGroup
                className={styles.radioButtonGroup}
                onChange={onChange}
                invalid={!!errors?.bedId?.message}
                invalidText={errors?.bedId?.message}>
                {bedDetails.map(({ id, label }) => (
                  <RadioButton key={id} labelText={label} control={control} value={id} checked={id === value} />
                ))}
              </RadioButtonGroup>
            )}
          />
        )}
        {showErrorNotifications && (
          <div className={styles.notifications}>
            {Object.values(errors).map((error) => (
              <InlineNotification lowContrast subtitle={error.message} />
            ))}
          </div>
        )}
      </div>
      <ButtonSet className={styles.buttonSet}>
        <Button size="xl" kind="secondary" onClick={closeWorkspaceWithSavedChanges}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" size="xl">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
}
