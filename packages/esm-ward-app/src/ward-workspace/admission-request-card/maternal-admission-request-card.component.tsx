import React, { useMemo, useState, type ReactNode } from 'react';
import { Checkbox, CheckboxGroup } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@openmrs/esm-framework';
import { makeWardPatient } from './maternal-admission-request-card.resource';
import type { InpatientRequest, MaternalWardViewContext, WardPatient } from '../../types';
import AdmissionRequestCardActions from './admission-request-card-actions.component';
import AdmissionRequestCardHeader from './admission-request-card-header.component';
import AdmissionRequestNoteRow from '../../ward-patient-card/card-rows/admission-request-note-row.component';
import CodedObsTagsRow from '../../ward-patient-card/card-rows/coded-obs-tags-row.component';
import MotherOrChild from '../../ward-patient-card/row-elements/ward-mother-or-child.component';
import styles from './admission-request-card.scss';

interface MaternalAdmissionRequestCardProps {
  wardPatient: WardPatient;
  children?: ReactNode;
  inpatientRequestsOfWardByPatientUuid: Record<string, InpatientRequest>;
}

const MaternalAdmissionRequestCard: React.FC<MaternalAdmissionRequestCardProps> = ({
  wardPatient,
  children,
  inpatientRequestsOfWardByPatientUuid,
}) => {
  const { motherChildRelationships } = useAppContext<MaternalWardViewContext>('maternal-ward-view-context') ?? {};
  const [selectedRelatedPatient, setCheckedRelatedPatient] = useState<string[]>([]);
  const { t } = useTranslation();

  const { childrenByMotherUuid, motherByChildUuid } = motherChildRelationships ?? {};

  const motherOfPatient = useMemo(
    () => motherByChildUuid?.get(wardPatient.patient.uuid) ?? null,
    [motherByChildUuid, wardPatient.patient.uuid],
  );

  const childrenOfPatient = useMemo(
    () => childrenByMotherUuid?.get(wardPatient.patient.uuid) ?? [],
    [childrenByMotherUuid, wardPatient.patient.uuid],
  );

  const relatedPendingWardMother: WardPatient | null = useMemo(() => {
    if (!motherOfPatient) return null;
    const request = inpatientRequestsOfWardByPatientUuid[motherOfPatient.patient.uuid];
    return request ? makeWardPatient(request) : null;
  }, [motherOfPatient, inpatientRequestsOfWardByPatientUuid]);

  const relatedPendingWardChildren: WardPatient[] = useMemo(() => {
    const wardPatients: WardPatient[] = [];
    for (const child of childrenOfPatient ?? []) {
      const request = inpatientRequestsOfWardByPatientUuid[child.patient.uuid];
      if (request) wardPatients.push(makeWardPatient(request));
    }
    return wardPatients;
  }, [childrenOfPatient, inpatientRequestsOfWardByPatientUuid]);

  const selectedRelatedWardPatients = useMemo(
    () =>
      [...(relatedPendingWardMother ? [relatedPendingWardMother] : []), ...relatedPendingWardChildren].filter((wp) =>
        selectedRelatedPatient.includes(wp.patient.uuid),
      ),
    [relatedPendingWardMother, relatedPendingWardChildren, selectedRelatedPatient],
  );

  return (
    <div className={styles.admissionRequestCard}>
      <AdmissionRequestCardHeader {...{ wardPatient }} />
      <CodedObsTagsRow id="pregnancy-complications" {...wardPatient} />
      {motherOfPatient && (
        <MotherOrChild
          otherPatient={motherOfPatient.patient}
          otherPatientAdmission={motherOfPatient.currentAdmission}
          isOtherPatientTheMother={true}>
          {relatedPendingWardMother && (
            <div>
              <CheckboxGroup legendText={''}>
                <Checkbox
                  checked={selectedRelatedPatient.includes(motherOfPatient.patient.uuid)}
                  className={styles.checkbox}
                  id={motherOfPatient.patient.uuid}
                  key={'also-transfer-' + motherOfPatient.patient.uuid}
                  labelText={
                    relatedPendingWardMother.inpatientRequest.dispositionType === 'ADMIT'
                      ? t('alsoAdmitOrCancel', 'Also admit / cancel:')
                      : t('alsoTransferOrCancel', 'Also transfer / cancel:')
                  }
                  onChange={(_, { checked, id }) => {
                    const currentValue = selectedRelatedPatient;
                    setCheckedRelatedPatient(
                      checked ? [...currentValue, id] : currentValue.filter((item) => item !== id),
                    );
                  }}
                />
              </CheckboxGroup>
            </div>
          )}
        </MotherOrChild>
      )}
      {childrenOfPatient?.map((childOfPatient) => (
        <MotherOrChild
          key={childOfPatient.patient.uuid}
          otherPatient={childOfPatient.patient}
          otherPatientAdmission={childOfPatient.currentAdmission}
          isOtherPatientTheMother={false}>
          {relatedPendingWardChildren.some((wp) => wp.patient.uuid === childOfPatient.patient.uuid) && (
            <div>
              <CheckboxGroup legendText={''}>
                <Checkbox
                  checked={selectedRelatedPatient.includes(childOfPatient.patient.uuid)}
                  className={styles.checkbox}
                  id={childOfPatient.patient.uuid}
                  key={'also-transfer-' + childOfPatient.patient.uuid}
                  labelText={
                    relatedPendingWardChildren.find((wp) => wp.patient.uuid === childOfPatient.patient.uuid)
                      ?.inpatientRequest.dispositionType === 'ADMIT'
                      ? t('alsoAdmitOrCancel', 'Also admit / cancel:')
                      : t('alsoTransferOrCancel', 'Also transfer / cancel:')
                  }
                  onChange={(_, { checked, id }) => {
                    const currentValue = selectedRelatedPatient;
                    setCheckedRelatedPatient(
                      checked ? [...currentValue, id] : currentValue.filter((item) => item !== id),
                    );
                  }}
                />
              </CheckboxGroup>
            </div>
          )}
        </MotherOrChild>
      ))}
      <AdmissionRequestNoteRow id={'admission-request-note'} wardPatient={wardPatient} />
      <AdmissionRequestCardActions wardPatient={wardPatient} relatedTransferPatients={selectedRelatedWardPatients} />
    </div>
  );
};

export default MaternalAdmissionRequestCard;
