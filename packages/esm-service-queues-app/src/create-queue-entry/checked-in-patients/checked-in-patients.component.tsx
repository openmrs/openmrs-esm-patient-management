import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Layer, SkeletonText, Tile } from '@carbon/react';
import {
  ErrorState,
  PatientBannerContactDetails,
  PatientBannerPatientInfo,
  PatientBannerToggleContactDetailsButton,
  PatientPhoto,
  useSession,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { useActiveVisits } from '../../metrics/metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import { useServiceQueuesStore } from '../../store/store';
import { mapActiveVisitPatientToFhir } from './checked-in-patients.resource';
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

interface CheckedInPatientRowProps extends CheckedInPatientsProps {
  visit: Visit;
}

/**
 * A single checked-in patient row, rendered with the same framework patient-banner components used
 * by patient-search results so the two lists look identical. Holds its own contact-details toggle
 * state, mirroring the search app's `PatientBanner`.
 */
const CheckedInPatientRow: React.FC<CheckedInPatientRowProps> = ({
  visit,
  onPatientSelected,
  launchChildWorkspace,
  closeWorkspace,
}) => {
  const [showContactDetails, setShowContactDetails] = useState(false);
  const patient = visit.patient;
  const patientUuid = patient?.uuid;
  const patientName = patient?.person?.display;
  const isDeceased = Boolean(patient?.person?.dead || patient?.person?.deathDate);
  const fhirPatient = useMemo(() => mapActiveVisitPatientToFhir(patient), [patient]);

  return (
    <li className={styles.patientRow}>
      <div className={styles.banner}>
        <button
          type="button"
          className={classNames(styles.patientBannerButton, styles.patientBanner)}
          onClick={() => onPatientSelected(patientUuid, fhirPatient, launchChildWorkspace, closeWorkspace)}>
          <div className={styles.patientAvatar}>
            <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
          </div>
          <PatientBannerPatientInfo patient={fhirPatient} />
        </button>
        <div className={styles.actionButtons}>
          <PatientBannerToggleContactDetailsButton
            className={styles.toggleContactDetailsButton}
            showContactDetails={showContactDetails}
            toggleContactDetails={() => setShowContactDetails((value) => !value)}
          />
        </div>
      </div>
      {showContactDetails && (
        <div className={styles.contactDetails}>
          <PatientBannerContactDetails patientId={patientUuid} deceased={isDeceased} />
        </div>
      )}
    </li>
  );
};

/**
 * Rendered in the "Add patient to queue" workspace before the user types a search term. Lists
 * patients whose visit started today and is still open at the selected queue location, and who are
 * not yet in a queue at that location, so a clerk can add them without searching. The list is
 * today-only, so an overnight or carried-over visit does not appear even though it is still open.
 * The queue exclusion is scoped to the selected location, so a patient already queued at another
 * location still appears here.
 * Selecting a row uses the same `onPatientSelected` as search.
 */
const CheckedInPatients: React.FC<CheckedInPatientsProps> = ({
  onPatientSelected,
  launchChildWorkspace,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const { selectedQueueLocationUuid } = useServiceQueuesStore();
  const locationUuid = selectedQueueLocationUuid ?? session?.sessionLocation?.uuid;

  const { activeVisits, isLoading: isLoadingVisits, error: visitsError } = useActiveVisits(locationUuid);
  const {
    queueEntries,
    isLoading: isLoadingQueueEntries,
    error: queueEntriesError,
  } = useQueueEntries({ location: locationUuid, isEnded: false }, 'custom:(uuid,patient:(uuid))');

  const queuedPatientUuids = useMemo(
    () => new Set((queueEntries ?? []).map((entry) => entry.patient?.uuid).filter(Boolean)),
    [queueEntries],
  );

  const checkedInPatients = useMemo(
    () => (activeVisits ?? []).filter((visit) => visit.patient?.uuid && !queuedPatientUuids.has(visit.patient.uuid)),
    [activeVisits, queuedPatientUuids],
  );

  const isLoading = isLoadingVisits || isLoadingQueueEntries;
  const error = visitsError ?? queueEntriesError;
  const heading = t('checkedInPatients', 'Checked in patients');

  return (
    <div className={styles.container}>
      <p className={styles.heading}>{heading}</p>
      {isLoading ? (
        <div className={styles.loading} data-testid="checked-in-patients-loading-skeleton">
          <SkeletonText paragraph lineCount={3} />
        </div>
      ) : error ? (
        <ErrorState error={error} headerTitle={heading} />
      ) : checkedInPatients.length === 0 ? (
        <Layer>
          <Tile className={styles.emptyState}>
            <p className={styles.emptyStateText}>
              {t('noCheckedInPatients', 'No checked-in patients waiting to be added to a queue at this location')}
            </p>
          </Tile>
        </Layer>
      ) : (
        <ul className={styles.patientList}>
          {checkedInPatients.map((visit) => (
            <CheckedInPatientRow
              key={visit.patient?.uuid}
              visit={visit}
              onPatientSelected={onPatientSelected}
              launchChildWorkspace={launchChildWorkspace}
              closeWorkspace={closeWorkspace}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default CheckedInPatients;
