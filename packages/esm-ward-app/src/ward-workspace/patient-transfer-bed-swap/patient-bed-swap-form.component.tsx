import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './patient-transfer-swap.scss';
import { useAdmissionLocation } from '../../hooks/useAdmissionLocation';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { filterBeds } from '../../ward-view/ward-view.resource';
import type { BedLayout, WardPatientWorkspaceProps } from '../../types';
import { assignPatientToBed, createEncounter } from '../../ward.resource';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import { showSnackbar, useSession } from '@openmrs/esm-framework';
import useWardLocation from '../../hooks/useWardLocation';
import { useInpatientRequest } from '../../hooks/useInpatientRequest';
import {
  Form,
  ButtonSet,
  Button,
  RadioButtonGroup,
  RadioButton,
  RadioButtonSkeleton,
  InlineNotification,
} from '@carbon/react';
import classNames from 'classnames';

export default function PatientBedSwapForm({
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
  wardPatient,
}: WardPatientWorkspaceProps) {
  const { patient } = wardPatient;
  const { t } = useTranslation();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const { isLoading, admissionLocation } = useAdmissionLocation();
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentProvider } = useSession();
  const { location } = useWardLocation();
  const { mutate: mutateAdmissionLocation } = useAdmissionLocation();
  const { mutate: mutateInpatientRequest } = useInpatientRequest();

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
      const patients = bed.patients.map((bedPatient) => bedPatient?.person?.preferredName?.display);
      const bedNumber = bed.bedNumber;
      return [bedNumber, ...(patients.length ? patients : [t('empty', 'Empty')])].join(' · ');
    },
    [t],
  );

  const beds = useMemo(() => (admissionLocation ? filterBeds(admissionLocation) : []), [admissionLocation]);
  const bedDetails = useMemo(
    () =>
      beds.map((bed) => {
        const isPatientAssignedToBed = bed.patients.find((bedPatient) => bedPatient.uuid === patient.uuid);
        return { id: bed.bedId, label: getBedInformation(bed), isPatientAssignedToBed };
      }),
    [beds, getBedInformation],
  );

  const onSubmit = useCallback(
    (values: FormValues) => {
      const bedSelected = beds.find((bed) => bed.bedId === values.bedId);
      setShowErrorNotifications(false);
      createEncounter({
        patient: patient.uuid,
        encounterType: emrConfiguration.transferWithinHospitalEncounterType.uuid,
        location: location?.uuid,
        encounterProviders: [
          {
            provider: currentProvider?.uuid,
            encounterRole: emrConfiguration.clinicianEncounterRole.uuid,
          },
        ],
        obs: [],
      })
        .then(async (response) => {
          if (response.ok) {
            return assignPatientToBed(values.bedId, patient.uuid, response.data.uuid);
          }
        })
        .then((response) => {
          if (response && response?.ok) {
            showSnackbar({
              kind: 'success',
              title: t('patientAssignedNewbed', 'Patient assigned to new bed'),
              subtitle: t('patientAssignedToBed', '{{patientName}} assigned to bed {{bedNumber}}', {
                patientName: patient.person.preferredName.display,
                bedNumber: bedSelected.bedNumber,
              }),
            });
            mutateAdmissionLocation();
            mutateInpatientRequest();
            closeWorkspaceWithSavedChanges();
          }
        })
        .catch((error: Error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorAssigningBedToPatient', 'Error assigning bed to patient'),
            subtitle: error?.message,
          });
          mutateAdmissionLocation();
          mutateInpatientRequest();
          closeWorkspaceWithSavedChanges();
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [setShowErrorNotifications, patient, emrConfiguration, currentProvider, location, beds],
  );

  const onError = useCallback(() => {
    setShowErrorNotifications(true);
  }, []);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      className={classNames(styles.formContainer, styles.workspaceContent)}>
      <div>
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
                {bedDetails.map(({ id, label, isPatientAssignedToBed }) => (
                  <RadioButton
                    key={id}
                    labelText={label}
                    control={control}
                    value={id}
                    checked={id === value}
                    disabled={isPatientAssignedToBed}
                  />
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
        <Button
          type="submit"
          size="xl"
          disabled={isLoadingEmrConfiguration || isSubmitting || errorFetchingEmrConfiguration}>
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
}
