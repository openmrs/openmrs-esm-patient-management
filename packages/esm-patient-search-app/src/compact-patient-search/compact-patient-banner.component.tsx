import React, { forwardRef, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import {
  ConfigurableLink,
  getPatientName,
  interpolateString,
  PatientBannerPatientInfo,
  PatientPhoto,
  useConfig,
} from '@openmrs/esm-framework';
import type { SearchedPatient } from '../types';
import { type PatientSearchConfig } from '../config-schema';
import { mapToFhirPatient } from '../utils/fhir-mapper';
import styles from './compact-patient-banner.scss';

interface ClickablePatientContainerProps {
  children: React.ReactNode;
  patient: fhir.Patient;
  /**
   * A function to execute instead of navigating the user to the patient
   * dashboard. If null/undefined, patient results will be links to the
   * patient dashboard.
   */
  nonNavigationSelectPatientAction?: (patientUuid: string, patient: fhir.Patient) => void;
  /**
   * A function to execute when the user clicks on a patient result. Will
   * be executed whether or not nonNavigationSelectPatientAction is defined,
   * just before navigation (or after nonNavigationSelectPatientAction is called).
   */
  patientClickSideEffect?: (patientUuid: string, patient: fhir.Patient) => void;
}

interface CompactPatientBannerProps {
  patients: Array<SearchedPatient>;
  nonNavigationSelectPatientAction?: (patientUuid: string, patient: fhir.Patient) => void;
  patientClickSideEffect?: (patientUuid: string, patient: fhir.Patient) => void;
}
/**
 * CompactPatientBanner displays a minimized summary of the currently active patient.
 *
 * It is used within the top navigation bar in desktop mode to display search results,
 * allowing quick visibility of the patient's name and ID without taking up much space.
 */
const CompactPatientBanner = forwardRef<HTMLDivElement, CompactPatientBannerProps>(
  ({ patients, nonNavigationSelectPatientAction, patientClickSideEffect }, ref) => {
    const fhirMappedPatients: Array<fhir.Patient> = useMemo(() => {
      return patients.map(mapToFhirPatient);
    }, [patients]);

    const renderPatient = useCallback(
      (patient: fhir.Patient) => {
        const patientName = getPatientName(patient);

        return (
          <ClickablePatientContainer
            key={patient.id}
            patient={patient}
            nonNavigationSelectPatientAction={nonNavigationSelectPatientAction}
            patientClickSideEffect={patientClickSideEffect}>
            <div className={styles.patientAvatar}>
              <PatientPhoto patientUuid={patient.id} patientName={patientName} />
            </div>
            <PatientBannerPatientInfo patient={patient} />
          </ClickablePatientContainer>
        );
      },
      [nonNavigationSelectPatientAction, patientClickSideEffect],
    );

    return <div ref={ref}>{fhirMappedPatients.map(renderPatient)}</div>;
  },
);

const ClickablePatientContainer = ({
  patient,
  children,
  nonNavigationSelectPatientAction,
  patientClickSideEffect,
}: ClickablePatientContainerProps) => {
  const config = useConfig<PatientSearchConfig>();
  const isDeceased = Boolean(patient?.deceasedDateTime);

  if (nonNavigationSelectPatientAction) {
    return (
      <button
        className={classNames(styles.patientSearchResult, styles.patientSearchResultButton, {
          [styles.deceased]: isDeceased,
        })}
        key={patient.id}
        onClick={() => {
          nonNavigationSelectPatientAction(patient.id, patient);
          patientClickSideEffect?.(patient.id, patient);
        }}>
        {children}
      </button>
    );
  }

  return (
    <ConfigurableLink
      className={classNames(styles.patientSearchResult, {
        [styles.deceased]: isDeceased,
      })}
      key={patient.id}
      onBeforeNavigate={() => patientClickSideEffect?.(patient.id, patient)}
      to={interpolateString(config.search.patientChartUrl, {
        patientUuid: patient.id,
      })}>
      {children}
    </ConfigurableLink>
  );
};

export default CompactPatientBanner;
