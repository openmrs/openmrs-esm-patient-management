import React, { useMemo } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { defaultPatientCardElementConfig, type WardConfigObject } from '../../config-schema';
import { getPatientCardElementFromDefinition } from '../../ward-patient-card/ward-patient-card-row.resources';
import type { PatientCardElementType, WardPatientCardProps } from '../../types';
import styles from './style.scss';
import useWardLocation from '../../hooks/useWardLocation';

const WardPatientWorkspaceBanner = ({ bed, patient, visit }: WardPatientCardProps) => {
  const { location } = useWardLocation();
  const { wardPatientCards } = useConfig<WardConfigObject>();
  const { cardDefinitions } = wardPatientCards;

  // extract configured elements for the patient card header to use for the banner section
  const bannerElements = useMemo(() => {
    const cardDefinition = cardDefinitions.find((cardDef) => {
      const appliedTo = cardDef.appliedTo;

      return appliedTo == null || appliedTo.some((criteria) => criteria.location == location.uuid);
    });

    const headerRow = cardDefinition.rows.find((cardDef) => cardDef.rowType === 'header');

    return headerRow.elements.map((elementType: PatientCardElementType) =>
      getPatientCardElementFromDefinition({
        id: elementType,
        elementType,
        config: defaultPatientCardElementConfig,
      }),
    );
  }, [cardDefinitions]);

  if (!(patient && bed && visit)) return null;

  return (
    <div className={styles.patientBanner}>
      {bannerElements.map((BannerElement) => (
        <BannerElement patient={patient} visit={visit} bed={bed} />
      ))}
    </div>
  );
};

export default WardPatientWorkspaceBanner;
