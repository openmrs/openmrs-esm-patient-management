import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type DefaultWorkspaceProps, ExtensionSlot, usePatient, type Patient } from '@openmrs/esm-framework';
import styles from './admit-patient-form.scss';
import { useAdmissionLocation } from '../../hooks/useAdmissionLocation';
import useWardLocation from '../../hooks/useWardLocation';
import { useTranslation } from 'react-i18next';
import { filterBeds } from '../../ward-view/ward-view.resource';
import type { BedLayout } from '../../types';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Column, DropdownSkeleton, Dropdown, ButtonSet, Button } from '@carbon/react';
import { InlineNotification } from '@carbon/react';

interface AdmitPatientFormWorkspaceProps extends DefaultWorkspaceProps {
  patient: Patient;
}

const AdmitPatientFormWorkspace: React.FC<AdmitPatientFormWorkspaceProps> = ({
  patient,
  closeWorkspace,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const { patient: fhirPatient, isLoading: isLoadingFhirPatient } = usePatient(patient?.uuid);
  const { location } = useWardLocation();
  const { isLoading, admissionLocation } = useAdmissionLocation(location?.uuid);
  const beds = isLoading ? [] : filterBeds(admissionLocation);
  const getBedRepresentation = useCallback((bedLayout: BedLayout) => {
    const bedNumber = bedLayout.bedNumber;
    const patients =
      bedLayout.patients.length === 0
        ? [t('emptyBed', 'Empty')]
        : bedLayout.patients.map((patient) => patient?.person?.preferredName?.display);
    return [bedNumber, ...patients].join(' · ');
  }, []);

  const zodSchema = useMemo(
    () =>
      z.object({
        bedId: z.number({
          required_error: t('bedIdRequired', 'Please select a bed to move forward'),
        }),
      }),
    [],
  );

  type FormValues = z.infer<typeof zodSchema>;

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    getValues,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty]);

  const onSubmit = useCallback((values: FormValues) => {
    setShowErrorNotifications(false);
  }, []);

  const onError = useCallback((values) => {
    setShowErrorNotifications(true);
  }, []);

  return (
    <Form control={control} className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
      <div className={styles.formContent}>
        <Row>
          <Column>
            <h2 className={styles.productiveHeading02}>{t('selectABed', 'Select a bed')}</h2>
            <div className={styles.BedSelectionDropdown}>
              <Controller
                control={control}
                name="bedId"
                render={({ field: { onChange }, fieldState: { error } }) => {
                  const selectedItem = beds.find((bed) => bed.bedId === getValues()?.bedId);
                  return isLoading ? (
                    <DropdownSkeleton />
                  ) : (
                    <Dropdown
                      id="default"
                      titleText=""
                      helperText=""
                      label={!selectedItem && t('chooseAnOption', 'Choose an option')}
                      items={beds}
                      itemToString={getBedRepresentation}
                      selectedItem={selectedItem}
                      onChange={({ selectedItem }: { selectedItem: BedLayout }) => onChange(selectedItem.bedId)}
                      invalid={!!error}
                      invalidText={error?.message}
                    />
                  );
                }}
              />
            </div>
          </Column>
        </Row>
        <div className={styles.errorNotifications}>
          {showErrorNotifications &&
            Object.entries(errors).map(([key, value]) => {
              return (
                <Row key={key}>
                  <Column>
                    <InlineNotification kind="error" subtitle={value.message} lowContrast />
                  </Column>
                </Row>
              );
            })}
        </div>
      </div>
      <ButtonSet className={styles.buttonSet}>
        <Button size="xl" kind="secondary" onClick={() => closeWorkspace({ ignoreChanges: true })}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" size="xl">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AdmitPatientFormWorkspace;
