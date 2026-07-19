import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, SkeletonText, Tile } from '@carbon/react';
import { PatientPhoto, useConfig, useSession, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { useActiveVisits } from '../../metrics/metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import { useServiceQueuesStore } from '../../store/store';
import styles from './checked-in-patients.scss';

interface CheckedInPatientsProps {
  onPatientSelected: (
    patientUuid: string,
    patient: fhir.Patient,
    launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
    closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
  ) => void;
  launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'];
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
}

/**
 * Rendered in the "Add patient to queue" workspace before the user types a search term. Lists
 * patients with an active visit at the selected queue location who are not yet in any queue, so a
 * clerk can add them without searching. Selecting a row uses the same `onPatientSelected` as search.
 */
const CheckedInPatients: React.FC<CheckedInPatientsProps> = ({
  onPatientSelected,
  launchChildWorkspace,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  // Read this app's config explicitly: the component renders inside another app's (patient-search) workspace.
  const { showRecentlyCheckedInPatientsBeforeSearch } = useConfig<ConfigObject>({
    externalModuleName: '@openmrs/esm-service-queues-app',
  });
  const session = useSession();
  const { selectedQueueLocationUuid } = useServiceQueuesStore();
  const locationUuid = selectedQueueLocationUuid ?? session?.sessionLocation?.uuid;

  // restrictToToday=false: a visit that started on an earlier day and is still open counts as checked in.
  const { activeVisits, isLoading: isLoadingVisits } = useActiveVisits(locationUuid, false);
  const { queueEntries, isLoading: isLoadingQueueEntries } = useQueueEntries(
    { location: locationUuid, isEnded: false },
    'custom:(uuid,patient:(uuid))',
  );

  const queuedPatientUuids = useMemo(
    () => new Set((queueEntries ?? []).map((entry) => entry.patient?.uuid).filter(Boolean)),
    [queueEntries],
  );

  const checkedInPatients = useMemo(
    () => (activeVisits ?? []).filter((visit) => visit.patient?.uuid && !queuedPatientUuids.has(visit.patient.uuid)),
    [activeVisits, queuedPatientUuids],
  );

  if (!showRecentlyCheckedInPatientsBeforeSearch) {
    return null;
  }

  const isLoading = isLoadingVisits || isLoadingQueueEntries;

  return (
    <div className={styles.container}>
      <p className={styles.heading}>{t('checkedInPatients', 'Checked in patients')}</p>
      {isLoading ? (
        <SkeletonText paragraph lineCount={3} />
      ) : checkedInPatients.length === 0 ? (
        <Layer>
          <Tile className={styles.emptyState}>
            <p className={styles.emptyStateText}>
              {t('noCheckedInPatients', 'No checked-in patients waiting to be added to a queue')}
            </p>
          </Tile>
        </Layer>
      ) : (
        <ul className={styles.patientList}>
          {checkedInPatients.map((visit) => {
            const patient = visit.patient;
            const patientUuid = patient.uuid;
            const patientName = patient.person?.display;
            const identifier = patient.identifiers?.[0]?.identifier;
            const age = patient.person?.age;
            const gender = patient.person?.gender;
            const details = [identifier, age != null ? String(age) : null, gender].filter(Boolean).join(' · ');

            return (
              <li key={patientUuid}>
                <button
                  type="button"
                  className={styles.patientRow}
                  onClick={() =>
                    onPatientSelected(
                      patientUuid,
                      { id: patientUuid } as fhir.Patient,
                      launchChildWorkspace,
                      closeWorkspace,
                    )
                  }>
                  <span className={styles.patientPhoto}>
                    <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
                  </span>
                  <span className={styles.patientInfo}>
                    <span className={styles.patientName}>{patientName}</span>
                    {details ? <span className={styles.patientDetails}>{details}</span> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CheckedInPatients;
