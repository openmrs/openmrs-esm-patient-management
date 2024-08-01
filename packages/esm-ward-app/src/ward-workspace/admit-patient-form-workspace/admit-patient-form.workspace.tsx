import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { showSnackbar, useFeatureFlag } from '@openmrs/esm-framework';
import styles from './admit-patient-form.scss';
import { useAdmissionLocation } from '../../hooks/useAdmissionLocation';
import useWardLocation from '../../hooks/useWardLocation';
import { useTranslation } from 'react-i18next';
import { filterBeds } from '../../ward-view/ward-view.resource';
import type { BedLayout, DispositionType } from '../../types';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Column, DropdownSkeleton, Dropdown, ButtonSet, Button } from '@carbon/react';
import { InlineNotification } from '@carbon/react';
import { assignPatientToBed, createEncounter } from '../../ward.resource';
import { useInpatientRequest } from '../../hooks/useInpatientRequest';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import type { AdmitPatientFormWorkspaceProps } from './types';

const AdmitPatientFormWorkspace: React.FC<AdmitPatientFormWorkspaceProps> = ({
  patient,
  dispositionType,
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
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');
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
        bedId:
          isBedManagementModuleInstalled && beds.length > 0
            ? z.number({
                required_error: t('bedSelectionRequired', 'Please select a bed'),
              })
            : z.number().optional(),
      }),
    [isBedManagementModuleInstalled, beds],
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
      createEncounter(
        patient.uuid,
        dispositionType === 'ADMIT'
          ? emrConfiguration.admissionEncounterType.uuid
          : dispositionType === 'TRANSFER'
            ? emrConfiguration.transferWithinHospitalEncounterType.uuid
            : null,
        location?.uuid,
      )
        .then(
          async (response) => {
            if (response.ok) {
              if (bedSelected) {
                return assignPatientToBed(values.bedId, patient.uuid, response.data.uuid);
              }
              return response;
            }
          },
          (err: Error) => {
            showSnackbar({
              kind: 'error',
              title: t('errorCreatingEncounter', 'Failed to create {{encounterType}} encounter', {
                encounterType:
                  dispositionType === 'ADMIT'
                    ? emrConfiguration.admissionEncounterType.display
                    : emrConfiguration.transferWithinHospitalEncounterType.display,
              }),
              subtitle: err.message,
            });
          },
        )
        .then(
          (response) => {
            if (response && response?.ok) {
              if (bedSelected) {
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
              } else {
                showSnackbar({
                  kind: 'success',
                  title: t('patientAdmittedSuccessfully', 'Patient admitted successfully'),
                  subtitle: t('patientAdmittedButBedNotAssigned', 'Patient admitted successfully to {{location}}', {
                    location: location?.display,
                  }),
                });
              }
              mutateAdmissionLocation();
              mutateInpatientRequest();
              closeWorkspaceWithSavedChanges();
            }
          },
          () => {
            showSnackbar({
              kind: 'warning',
              title: t('patientAdmittedSuccessfully', 'Patient admitted successfully'),
              subtitle: t(
                'patientAdmittedButBedNotAssigned',
                'Patient admitted successfully but no bed was assigned to the patient',
              ),
            });
            mutateAdmissionLocation();
            mutateInpatientRequest();
            closeWorkspaceWithSavedChanges();
          },
        )
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [beds, patient, emrConfiguration, location, closeWorkspaceWithSavedChanges, dispositionType],
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
              {isBedManagementModuleInstalled ? (
                isLoading ? (
                  <DropdownSkeleton />
                ) : beds.length ? (
                  <Controller
                    control={control}
                    name="bedId"
                    render={({ field: { onChange }, fieldState: { error } }) => {
                      const selectedItem = beds.find((bed) => bed.bedId === getValues()?.bedId);
                      return (
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
                ) : (
                  <InlineNotification
                    kind="error"
                    title={t('noBedsConfiguredForLocation', 'No beds configured for {{location}} location', {
                      location: location?.display,
                    })}
                    lowContrast
                    hideCloseButton
                  />
                )
              ) : (
                <InlineNotification
                  kind="info"
                  title={t('unableToSelectBeds', 'Unable to select beds')}
                  subtitle={t(
                    'bedManagementModuleNotInstalled',
                    'Bed management module is not present to allow bed selection',
                  )}
                  lowContrast
                  hideCloseButton
                />
              )}
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
          {!isSubmitting ? t('admit', 'Admit') : t('admitting', 'Admitting...')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AdmitPatientFormWorkspace;
