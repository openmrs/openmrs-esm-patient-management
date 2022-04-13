import React from 'react';
import { useRecommendedVisitTypes } from '../hooks/useRecommendedVisitTypes';
import BaseVisitType from './base-visit-type.component';
import { PatientProgram } from '../../types/index';
import { StructuredListSkeleton } from 'carbon-components-react';

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

  return (
    <div style={{ marginTop: '0.625rem' }}>
      {isLoading ? (
        <StructuredListSkeleton />
      ) : (
        <BaseVisitType onChange={onChange} visitTypes={recommendedVisitTypes} patientUuid={patientUuid} />
      )}
    </div>
  );
};

export const MemoizedRecommendedVisitType = React.memo(RecommendedVisitType);
