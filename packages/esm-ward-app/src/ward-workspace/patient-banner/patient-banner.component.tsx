import { useConfig } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { defaultPatientCardElementConfig, type WardConfigObject } from '../../config-schema';
import useWardLocation from '../../hooks/useWardLocation';
import type { PatientCardElementType, WardPatient } from '../../types';
import { getPatientCardElementFromDefinition } from '../../ward-patient-card/ward-patient-card-row.resources';
import styles from './style.scss';

const WardPatientWorkspaceBanner = (props: WardPatient) => {
  const { location } = useWardLocation();
  const { wardPatientCards } = useConfig<WardConfigObject>();
  const { cardDefinitions } = wardPatientCards;
  const {patient, bed, visit} = props;

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
        <BannerElement {...props} />
      ))}
    </div>
  );
};

export default WardPatientWorkspaceBanner;
