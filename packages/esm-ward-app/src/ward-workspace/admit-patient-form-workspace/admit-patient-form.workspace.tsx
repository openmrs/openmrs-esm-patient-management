import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ButtonSet, Column, Form, InlineNotification, Row } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { showSnackbar, useAppContext } from '@openmrs/esm-framework';
import type { WardPatientWorkspaceProps, WardViewContext } from '../../types';
import { useAssignedBedByPatient } from '../../hooks/useAssignedBedByPatient';
import { assignPatientToBed, removePatientFromBed, useAdmitPatient } from '../../ward.resource';
import useWardLocation from '../../hooks/useWardLocation';
import BedSelector from '../bed-selector.component';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './admit-patient-form.scss';

/**
 * This form gets rendered when the user clicks "admit patient" in
 * the patient card in the admission requests workspace, but only when
 * the bed management module is installed. It asks to (optionally) select
 * a bed to assign to patient
 */
const AdmitPatientFormWorkspace: React.FC<WardPatientWorkspaceProps> = ({
  wardPatient,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const { patient, inpatientRequest } = wardPatient ?? {};
  const dispositionType = inpatientRequest?.dispositionType ?? 'ADMIT';

  const { t } = useTranslation();
  const { location } = useWardLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { admitPatient, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useAdmitPatient();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { isLoading } = wardPatientGroupDetails?.admissionLocationResponse ?? {};

  const { data: bedsAssignedToPatient, isLoading: isLoadingBedsAssignedToPatient } = useAssignedBedByPatient(
    patient.uuid,
  );
  const beds = isLoading ? [] : wardPatientGroupDetails?.bedLayouts ?? [];

  const zodSchema = useMemo(
    () =>
      z.object({
        bedId: z.number().optional(),
      }),
    [],
  );

  type FormValues = z.infer<typeof zodSchema>;

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const onSubmit = (values: FormValues) => {
    setShowErrorNotifications(false);
    setIsSubmitting(true);
    const bedSelected = beds.find((bed) => bed.bedId === values.bedId);
    admitPatient(patient, dispositionType)
      .then(
        async (response) => {
          if (response.ok) {
            if (bedSelected) {
              return assignPatientToBed(values.bedId, patient.uuid, response.data.uuid);
            } else {
              const assignedBedId = bedsAssignedToPatient?.data?.results?.[0]?.bedId;
              if (assignedBedId) {
                return removePatientFromBed(assignedBedId, patient.uuid);
              }
              return response;
            }
          }
        },
        (err: Error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorCreatingEncounter', 'Failed to admit patient'),
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
                  '{{patientName}} has been successfully admitted and assigned to bed {{bedNumber}}',
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
                subtitle: t('patientAdmittedWoBed', 'Patient admitted successfully to {{location}}', {
                  location: location?.display,
                }),
              });
            }
          }
        },
        () => {
          showSnackbar({
            kind: 'warning',
            title: t('patientAdmittedSuccessfully', 'Patient admitted successfully'),
            subtitle: t(
              'patientAdmittedButBedNotAssigned',
              'Patient admitted successfully but fail to assign bed to patient',
            ),
          });
        },
      )
      .finally(() => {
        setIsSubmitting(false);
        wardPatientGroupDetails?.mutate?.();
        closeWorkspaceWithSavedChanges();
      });
  };

  const onError = useCallback((values) => {
    setShowErrorNotifications(true);
    setIsSubmitting(false);
  }, []);

  if (!wardPatientGroupDetails) return <></>;

  return (
    <div className={styles.flexWrapper}>
      <WardPatientWorkspaceBanner {...{ wardPatient }} />
      <Form control={control} className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
        <div className={styles.formContent}>
          <Row>
            <Column>
              <h2 className={styles.productiveHeading02}>{t('selectABed', 'Select a bed')}</h2>
              <div className={styles.bedSelectionDropdown}>
                <Controller
                  control={control}
                  name="bedId"
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    return (
                      <BedSelector
                        beds={beds}
                        isLoadingBeds={isLoading}
                        currentPatient={patient}
                        selectedBedId={value}
                        error={error}
                        control={control}
                        onChange={onChange}
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
            disabled={
              isSubmitting ||
              isLoadingEmrConfiguration ||
              errorFetchingEmrConfiguration ||
              isLoading ||
              isLoadingBedsAssignedToPatient
            }>
            {!isSubmitting ? t('admit', 'Admit') : t('admitting', 'Admitting...')}
          </Button>
        </ButtonSet>
      </Form>
    </div>
  );
};

export default AdmitPatientFormWorkspace;
