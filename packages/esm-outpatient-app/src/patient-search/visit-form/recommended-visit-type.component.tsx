import React from 'react';
import { useRecommendedVisitTypes } from '../hooks/useRecommendedVisitTypes';
import BaseVisitType from './base-visit-type.component';
import { PatientProgram } from '../../types/index';
import { useTranslation } from 'react-i18next';
import styles from './base-visit-type.scss';
import { useLayoutType } from '@openmrs/esm-framework';
import { Tile } from 'carbon-components-react';
import EmptyDataIllustration from '../empty-data-illustration.component';

interface RecommendedVisitTypeProp {
  patientUuid: string;
  patientProgramEnrollment: PatientProgram;
  onChange: (visitTypeUuid) => void;
  locationUuid: string;
}

const RecommendedVisitType: React.FC<RecommendedVisitTypeProp> = ({
  patientUuid,
  patientProgramEnrollment,
  onChange,
  locationUuid,
}) => {
  const { recommendedVisitTypes, error, isLoading } = useRecommendedVisitTypes(
    patientUuid,
    patientProgramEnrollment?.uuid,
    patientProgramEnrollment?.program?.uuid,
    locationUuid,
  );
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  return (
    <div style={{ marginTop: '0.625rem' }}>
      {recommendedVisitTypes.length > 0 ? (
        <BaseVisitType onChange={onChange} visitTypes={recommendedVisitTypes} patientUuid={patientUuid} />
      ) : (
        <Tile light className={styles.tile}>
          <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('recommendedVisitType', 'Recommended Visit type')}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>
            {t('noRecommendedVisitTypes', 'There are no recommended visit types to display for this patient')}
          </p>
        </Tile>
      )}
    </div>
  );
};

export const MemoizedRecommendedVisitType = React.memo(RecommendedVisitType);
