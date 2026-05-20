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
import type { PatientSearchCallbackProps, SearchedPatient } from '../types';
import { type PatientSearchConfig } from '../config-schema';
import { mapToFhirPatient } from '../utils/fhir-mapper';
import styles from './compact-patient-banner.scss';

interface ClickablePatientContainerProps extends PatientSearchCallbackProps {
  children: React.ReactNode;
  patient: fhir.Patient;
}

interface CompactPatientBannerProps extends PatientSearchCallbackProps {
  patients: Array<SearchedPatient>;
}
/**
 * CompactPatientBanner displays a minimized summary of the currently active patient.
 *
 * It is used within the top navigation bar in desktop mode to display search results,
 * allowing quick visibility of the patient's name and ID without taking up much space.
 */
const CompactPatientBanner = forwardRef<HTMLDivElement, CompactPatientBannerProps>(
  ({ patients, onPatientSelected, patientClickSideEffect }, ref) => {
    const renderedPatients = useMemo(
      () =>
        patients.map((patient) => {
          const fhirPatient = mapToFhirPatient(patient);
          const patientName = getPatientName(fhirPatient);

          return (
            <ClickablePatientContainer
              key={fhirPatient.id}
              patient={fhirPatient}
              onPatientSelected={onPatientSelected}
              patientClickSideEffect={patientClickSideEffect}>
              <div className={styles.patientAvatar}>
                <PatientPhoto patientUuid={fhirPatient.id} patientName={patientName} />
              </div>
              <PatientBannerPatientInfo patient={fhirPatient} />
            </ClickablePatientContainer>
          );
        }),
      [patients, onPatientSelected, patientClickSideEffect],
    );

    return <div ref={ref}>{renderedPatients}</div>;
  },
);

const ClickablePatientContainer = ({
  patient,
  children,
  onPatientSelected,
  patientClickSideEffect,
}: ClickablePatientContainerProps) => {
  const config = useConfig<PatientSearchConfig>();
  const isDeceased = Boolean(patient?.deceasedDateTime);

  if (onPatientSelected) {
    return (
      <button
        className={classNames(styles.patientSearchResult, styles.patientSearchResultButton, {
          [styles.deceased]: isDeceased,
        })}
        key={patient.id}
        onClick={() => {
          onPatientSelected(patient.id, patient);
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
