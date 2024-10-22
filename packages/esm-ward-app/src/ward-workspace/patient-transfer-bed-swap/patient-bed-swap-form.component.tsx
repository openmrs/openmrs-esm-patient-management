import { Button, ButtonSet, Form, InlineNotification } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { showSnackbar, useAppContext, useSession } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import useWardLocation from '../../hooks/useWardLocation';
import type { BedLayout, WardPatientWorkspaceProps, WardViewContext } from '../../types';
import { assignPatientToBed, createEncounter, removePatientFromBed } from '../../ward.resource';
import BedSelector from '../bed-selector.component';
import styles from './patient-transfer-swap.scss';

export default function PatientBedSwapForm({
  promptBeforeClosing,
  closeWorkspaceWithSavedChanges,
  wardPatient,
}: WardPatientWorkspaceProps) {
  const { patient } = wardPatient;
  const { t } = useTranslation();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentProvider } = useSession();
  const { location } = useWardLocation();
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { isLoading } = wardPatientGroupDetails?.admissionLocationResponse ?? {};

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

  const beds = wardPatientGroupDetails?.bedLayouts ?? [];

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
            if (bedSelected) {
              return assignPatientToBed(values.bedId, patient.uuid, response.data.uuid);
            } else {
              // get the bed that the patient is currently assigned to
              const bedAssignedToPatient = beds.find((bed) =>
                bed.patients.some((bedPatient) => bedPatient.uuid == patient.uuid),
              );
              if (bedAssignedToPatient) {
                return removePatientFromBed(bedAssignedToPatient.bedId, patient.uuid);
              } else {
                // no-op
                return Promise.resolve({ ok: true });
              }
            }
          }
        })
        .then((response) => {
          if (response && response?.ok) {
            if (bedSelected) {
              showSnackbar({
                kind: 'success',
                title: t('patientAssignedNewBed', 'Patient assigned to new bed'),
                subtitle: t('patientAssignedNewBedDetail', '{{patientName}} assigned to bed {{bedNumber}}', {
                  patientName: patient.person.preferredName.display,
                  bedNumber: bedSelected.bedNumber,
                }),
              });
            } else {
              showSnackbar({
                kind: 'success',
                title: t('patientUnassignedFromBed', 'Patient unassigned from bed'),
                subtitle: t('patientUnassignedFromBedDetail', '{{patientName}} is now unassigned from bed', {
                  patientName: patient.person.preferredName.display,
                }),
              });
            }
          }
        })
        .catch((error: Error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorChangingPatientBedAssignment', 'Error changing patient bed assignment'),
            subtitle: error?.message,
          });
        })
        .finally(() => {
          setIsSubmitting(false);
          wardPatientGroupDetails.mutate();
          closeWorkspaceWithSavedChanges();
        });
    },
    [setShowErrorNotifications, patient, emrConfiguration, currentProvider, location, beds, wardPatientGroupDetails],
  );

  const onError = useCallback(() => {
    setShowErrorNotifications(true);
  }, []);

  if (!wardPatientGroupDetails) return <></>;
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
        <Controller
          name="bedId"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <BedSelector
              beds={beds}
              isLoadingBeds={isLoading}
              currentPatient={patient}
              selectedBedId={value}
              error={error}
              control={control}
              onChange={onChange}
            />
          )}
        />
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
