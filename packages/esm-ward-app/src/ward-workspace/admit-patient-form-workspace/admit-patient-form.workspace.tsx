import React, { useCallback, useMemo, useState } from 'react';
import { Button, ButtonSet, Column, Form, InlineNotification, Row } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  closeWorkspaceGroup2,
  showSnackbar,
  useAppContext,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import type { WardPatientWorkspaceProps, WardViewContext } from '../../types';
import {
  assignPatientToBed,
  getAssignedBedByPatient,
  removePatientFromBed,
  useAdmitPatient,
} from '../../ward.resource';
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
const AdmitPatientFormWorkspace: React.FC<Workspace2DefinitionProps<WardPatientWorkspaceProps, {}, {}>> = ({
  workspaceProps: { wardPatient, relatedTransferPatients },
  closeWorkspace,
}) => {
  const { patient, inpatientRequest, visit } = wardPatient ?? {};
  const dispositionType = inpatientRequest?.dispositionType ?? 'ADMIT';

  const { t } = useTranslation();
  const { location } = useWardLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { admitPatient, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useAdmitPatient();
  const [showErrorNotifications, setShowErrorNotifications] = useState(false);
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { isLoading } = wardPatientGroupDetails?.admissionLocationResponse ?? {};

  const beds = isLoading ? [] : (wardPatientGroupDetails?.bedLayouts ?? []);

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

  const onSubmit = (values: FormValues) => {
    setShowErrorNotifications(false);
    setIsSubmitting(true);
    const bedSelected = beds.find((bed) => bed.bedId === values.bedId);
    const allPatientsToAdmit = [wardPatient, ...(relatedTransferPatients ?? [])];

    return Promise.allSettled(
      allPatientsToAdmit.map((wp) =>
        admitPatient(wp.patient, wp.inpatientRequest?.dispositionType ?? dispositionType, wp.visit.uuid),
      ),
    )
      .then(async (admitResults) => {
        await Promise.allSettled(
          admitResults.map(async (result, i) => {
            const wp = allPatientsToAdmit[i];
            const patientName = wp.patient.person.preferredName.display;

            if (result.status === 'rejected') {
              showSnackbar({
                kind: 'error',
                title: t('errorAdmittingPatient', 'Failed to admit {{patientName}}', { patientName }),
                subtitle: (result.reason as Error)?.message,
              });
              return;
            }

            try {
              if (bedSelected) {
                // assign patient, and related transfer patients to the same bed.
                // (Support for related patients is only implemented for maternal ward)
                await assignPatientToBed(values.bedId, wp.patient.uuid, result.value.data.uuid);
                showSnackbar({
                  kind: 'success',
                  title: t('patientAdmittedSuccessfully', 'Patient admitted successfully'),
                  subtitle: t(
                    'patientAdmittedSuccessfullySubtitle',
                    '{{patientName}} has been successfully admitted and assigned to bed {{bedNumber}}',
                    { patientName, bedNumber: bedSelected.bedNumber },
                  ),
                });
              } else {
                const bedResponse = await getAssignedBedByPatient(wp.patient.uuid);
                const assignedBedId = bedResponse.data?.results?.[0]?.bedId;
                if (assignedBedId) {
                  await removePatientFromBed(assignedBedId, wp.patient.uuid);
                }
                showSnackbar({
                  kind: 'success',
                  title: t('patientAdmittedSuccessfully', 'Patient admitted successfully'),
                  subtitle: t('patientAdmittedWoBed', '{{patientName}} admitted successfully to {{location}}', {
                    patientName,
                    location: location?.display,
                  }),
                });
              }
            } catch {
              showSnackbar({
                kind: 'warning',
                title: t('patientAdmittedSuccessfully', 'Patient admitted successfully'),
                subtitle: t(
                  'patientAdmittedButBedNotAssigned',
                  '{{patientName}} admitted successfully but failed to assign bed',
                  { patientName },
                ),
              });
            }
          }),
        );

        if (admitResults.some((r) => r.status === 'fulfilled')) {
          closeWorkspace({ discardUnsavedChanges: true });
          closeWorkspaceGroup2();
        }
      })
      .finally(async () => {
        await wardPatientGroupDetails?.mutate?.();
        setIsSubmitting(false);
      });
  };

  const onError = useCallback(() => {
    setShowErrorNotifications(true);
    setIsSubmitting(false);
  }, []);

  if (!wardPatientGroupDetails) {
    return null;
  }

  return (
    <Workspace2 title={t('admitPatient', 'Admit patient')} hasUnsavedChanges={isDirty}>
      <div className={styles.flexWrapper}>
        <WardPatientWorkspaceBanner {...{ wardPatient }} />
        {relatedTransferPatients?.map((rp) => (
          <WardPatientWorkspaceBanner key={rp.patient.uuid} wardPatient={rp} />
        ))}
        <Form className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
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
            <Button size="xl" kind="secondary" onClick={() => closeWorkspace()}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              size="xl"
              disabled={isSubmitting || isLoadingEmrConfiguration || errorFetchingEmrConfiguration || isLoading}>
              {!isSubmitting ? t('admit', 'Admit') : t('admitting', 'Admitting...')}
            </Button>
          </ButtonSet>
        </Form>
      </div>
    </Workspace2>
  );
};

export default AdmitPatientFormWorkspace;
