import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSet, Form, InlineNotification, CheckboxGroup, Checkbox, Stack } from '@carbon/react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showSnackbar, useAppContext } from '@openmrs/esm-framework';
import { assignPatientToBed, removePatientFromBed, useCreateEncounter } from '../../ward.resource';
import { type PatientAdmitOrTransferFormProps } from './patient-admit-or-transfer-request-form.component';
import { type WardViewContext } from '../../types';
import BedSelector from '../bed-selector.component';
import WardPatientIdentifier from '../../ward-patient-card/row-elements/ward-patient-identifier.component';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name.component';
import styles from './patient-transfer-swap.scss';

export default function PatientBedSwapForm({
  wardPatient,
  relatedTransferPatients = [],
  onCancel,
  onSuccess,
}: PatientAdmitOrTransferFormProps) {
  const { patient } = wardPatient;
  const { t } = useTranslation();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { isLoading } = wardPatientGroupDetails?.admissionLocationResponse ?? {};
  const [selectedRelatedPatient, setCheckedRelatedPatient] = useState<string[]>([]);

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
  } = useForm<FormValues>({ resolver: zodResolver(zodSchema) });

  const beds = useMemo(() => wardPatientGroupDetails?.bedLayouts ?? [], [wardPatientGroupDetails]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      const bedSelected = beds.find((bed) => bed.bedId === values.bedId);
      setIsSubmitting(true);
      setShowErrorNotifications(false);

      const wardPatientsToSwap = [
        wardPatient,
        ...relatedTransferPatients.filter((rp) => selectedRelatedPatient.includes(rp.patient.uuid)),
      ];

      Promise.all(
        wardPatientsToSwap.map(async (wardPatientToSwap) => {
          const { patient: patientToSwap, visit: patientToSwapVisit } = wardPatientToSwap;

          const response = await createEncounter(
            patientToSwap,
            emrConfiguration.bedAssignmentEncounterType,
            patientToSwapVisit.uuid,
          );
          if (response.ok) {
            if (bedSelected) {
              return assignPatientToBed(values.bedId, patientToSwap.uuid, response.data.uuid);
            } else {
              // get the bed that the patient is currently assigned to
              const bedAssignedToPatient = beds.find((bed) =>
                bed.patients.some((bedPatient) => bedPatient.uuid == patientToSwap.uuid),
              );
              if (bedAssignedToPatient) {
                return removePatientFromBed(bedAssignedToPatient.bedId, patientToSwap.uuid);
              } else {
                // no-op
                return Promise.resolve({ ok: true });
              }
            }
          }
        }),
      )
        .then((responses) => {
          if (responses.every((response) => response?.ok)) {
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
            onSuccess();
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
        });
    },
    [
      beds,
      createEncounter,
      patient,
      emrConfiguration,
      t,
      wardPatientGroupDetails,
      onSuccess,
      selectedRelatedPatient,
      relatedTransferPatients,
      wardPatient,
    ],
  );

  const onError = useCallback(() => {
    setShowErrorNotifications(true);
  }, []);

  if (!wardPatientGroupDetails) {
    return null;
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      className={classNames(styles.formContainer, styles.workspaceContent)}>
      <Stack gap={4}>
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
        {relatedTransferPatients?.length > 0 && (
          <div>
            <CheckboxGroup legendText={t('alsoSwap', 'Also swap:')}>
              {relatedTransferPatients?.map(({ patient: relatedPatient }) => (
                <div key={'also-swap-' + relatedPatient.uuid}>
                  <Checkbox
                    checked={selectedRelatedPatient.includes(relatedPatient.uuid)}
                    className={styles.checkbox}
                    id={relatedPatient.uuid}
                    labelText={
                      <div className={styles.relatedPatientTransferSwapOption}>
                        <WardPatientName patient={relatedPatient} />
                        <WardPatientIdentifier id="patient-identifier" patient={relatedPatient} />
                      </div>
                    }
                    onChange={(_event, { checked, id }) => {
                      const currentValue = selectedRelatedPatient;
                      setCheckedRelatedPatient(
                        checked ? [...currentValue, id] : currentValue.filter((item) => item !== id),
                      );
                    }}
                  />
                </div>
              ))}
            </CheckboxGroup>
          </div>
        )}
        <div className={styles.field}>
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
        </div>
        {showErrorNotifications && (
          <div className={styles.notifications}>
            {Object.values(errors).map((error) => (
              <InlineNotification lowContrast subtitle={error.message} />
            ))}
          </div>
        )}
      </Stack>
      <ButtonSet className={styles.buttonSet}>
        <Button size="xl" kind="secondary" onClick={onCancel}>
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
