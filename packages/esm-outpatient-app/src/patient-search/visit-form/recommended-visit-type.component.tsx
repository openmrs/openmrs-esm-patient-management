import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { useRecommendedVisitTypes } from '../hooks/useRecommendedVisitTypes';
import { PatientProgram } from '../../types/index';
import { useTranslation } from 'react-i18next';
import EmptyDataIllustration from '../empty-data-illustration.component';
import BaseVisitType from './base-visit-type.component';
import styles from './base-visit-type.scss';

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
        <Layer>
          <Tile className={styles.tile}>
            <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
              <h4>{t('recommendedVisitType', 'Recommended Visit type')}</h4>
            </div>
            <EmptyDataIllustration />
            <p className={styles.content}>
              {t('noRecommendedVisitTypes', 'There are no recommended visit types to display for this patient')}
            </p>
          </Tile>
        </Layer>
      )}
    </div>
  );
};

export const MemoizedRecommendedVisitType = React.memo(RecommendedVisitType);
