import { age } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type Encounter } from '../../types';

export interface WardPatientTimeOnWardProps {
  encounterAssigningToCurrentInpatientLocation: Encounter;
}

const WardPatientTimeOnWard: React.FC<WardPatientTimeOnWardProps> = ({
  encounterAssigningToCurrentInpatientLocation,
}) => {
  const { t } = useTranslation();
  if (encounterAssigningToCurrentInpatientLocation) {
    const timeOnWard = age(encounterAssigningToCurrentInpatientLocation.encounterDatetime);
    return <div>{t('timeOnWard', 'Time on this ward: {{timeOnWard}}', { timeOnWard })}</div>;
  } else {
    return <></>;
  }
};

export default WardPatientTimeOnWard;
