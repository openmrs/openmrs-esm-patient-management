import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type DefaultWorkspaceProps,
  ExtensionSlot,
  usePatient,
  type Patient,
  useConfig,
  showSnackbar,
} from '@openmrs/esm-framework';
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
import { assignPatientToBed, createEncounter } from '../../ward.resource';
import { useInpatientRequest } from '../../hooks/useInpatientRequest';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';

interface AdmitPatientFormWorkspaceProps extends DefaultWorkspaceProps {
  patient: Patient;
}

const AdmitPatientFormWorkspace: React.FC<AdmitPatientFormWorkspaceProps> = ({
  patient,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const { location } = useWardLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: mutateInpatientRequest } = useInpatientRequest();
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const { isLoading, admissionLocation, mutate: mutateAdmissionLocation } = useAdmissionLocation();
  const beds = useMemo(() => (isLoading ? [] : filterBeds(admissionLocation)), [admissionLocation]);
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
          required_error: t('bedSelectionRequired', 'Please select a bed'),
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

  const onSubmit = useCallback(
    (values: FormValues) => {
      setShowErrorNotifications(false);
      setIsSubmitting(true);
      const bedSelected = beds.find((bed) => bed.bedId === values.bedId);
      createEncounter(patient.uuid, emrConfiguration.admissionEncounterType.uuid, location?.uuid)
        .then(async (response) => {
          if (response.ok) {
            return assignPatientToBed(values.bedId, patient.uuid, response.data.uuid);
          }
        })
        .then(() => {
          setIsSubmitting(false);
          showSnackbar({
            kind: 'success',
            title: t('patientAdmittedSuccessfully', 'Patient admitted successfully'),
            subtitle: t(
              'patientAdmittedSuccessfullySubtitle',
              '{{patientName}} has been successfully admitted to the bed {{bedNumber}}',
              {
                patientName: patient.person.preferredName.display,
                bedNumber: bedSelected.bedNumber,
              },
            ),
          });
          mutateAdmissionLocation();
          mutateInpatientRequest();
          closeWorkspaceWithSavedChanges();
        });
    },
    [beds, patient, emrConfiguration, location, closeWorkspaceWithSavedChanges],
  );

  const onError = useCallback((values) => {
    setShowErrorNotifications(true);
    setIsSubmitting(false);
  }, []);

  return (
    <Form control={control} className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
      <div className={styles.formContent}>
        {errorFetchingEmrConfiguration && (
          <div className={styles.formError}>
            <InlineNotification
              kind="error"
              title={t('somePartsOfTheFormDidntLoad', "Some parts of the form didn't load")}
              subtitle={t(
                'fetchingEmrConfigurationFailed',
                'Fetching EMR configuration failed. Try refreshing the page or contact your system administrator.',
              )}
              lowContrast
              hideCloseButton
            />
          </div>
        )}
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
        <Button
          type="submit"
          size="xl"
          disabled={isSubmitting || isLoadingEmrConfiguration || errorFetchingEmrConfiguration}>
          {!isSubmitting ? t('save', 'Save') : t('saving', 'Saving...')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AdmitPatientFormWorkspace;
