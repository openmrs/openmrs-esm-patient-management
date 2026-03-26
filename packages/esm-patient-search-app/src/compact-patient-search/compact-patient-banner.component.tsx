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
import { usePatientSearchContext } from '../patient-search-context';
import PatientSearchActionButtons from '../patient-search-action-buttons.component';
import { mapToFhirPatient } from '../utils/fhir-mapper';
import styles from './compact-patient-banner.scss';

interface ClickablePatientContainerProps {
  children: React.ReactNode;
  patient: fhir.Patient;
}

interface CompactPatientBannerProps {
  patients: Array<SearchedPatient>;
}

const CompactPatientBanner = forwardRef<HTMLDivElement, CompactPatientBannerProps>(({ patients }, ref) => {
  const fhirMappedPatients: Array<fhir.Patient> = useMemo(() => {
    return patients.map(mapToFhirPatient);
  }, [patients]);

  const renderPatient = useCallback(
    (patient: fhir.Patient) => <CompactPatientResultCard key={patient.id} patient={patient} />,
    [],
  );

  return <div ref={ref}>{fhirMappedPatients.map(renderPatient)}</div>;
});

interface CompactPatientResultCardProps {
  patient: fhir.Patient;
}

const CompactPatientResultCard: React.FC<CompactPatientResultCardProps> = ({ patient }) => {
  const { patientClickSideEffect } = usePatientSearchContext();
  const isDeceased = Boolean(patient?.deceasedDateTime);
  const patientName = getPatientName(patient);

  return (
    <div
      className={classNames(styles.patientSearchResultCard, {
        [styles.deceased]: isDeceased,
      })}>
      <ClickablePatientContainer patient={patient}>
        <div className={styles.patientAvatar}>
          <PatientPhoto patientUuid={patient.id} patientName={patientName} />
        </div>
        <PatientBannerPatientInfo patient={patient} />
      </ClickablePatientContainer>
      {!isDeceased && (
        <PatientSearchActionButtons
          onActionComplete={() => patientClickSideEffect?.(patient.id, patient)}
          patientUuid={patient.id}
          variant="compact"
        />
      )}
    </div>
  );
};

const ClickablePatientContainer = ({ patient, children }: ClickablePatientContainerProps) => {
  const { nonNavigationSelectPatientAction, patientClickSideEffect } = usePatientSearchContext();
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
