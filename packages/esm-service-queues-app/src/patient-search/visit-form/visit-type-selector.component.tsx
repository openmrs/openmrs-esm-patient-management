import React, { useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import debounce from 'lodash-es/debounce';
import isEmpty from 'lodash-es/isEmpty';
import { useTranslation } from 'react-i18next';
import { Layer, Search, RadioButtonGroup, RadioButton, StructuredListSkeleton, Tile } from '@carbon/react';
import {
  ResponsiveWrapper,
  reportError,
  useDebounce,
  useLayoutType,
  usePagination,
  useVisitTypes,
  type VisitType,
} from '@openmrs/esm-framework';
import EmptyDataIllustration from '../empty-data-illustration.component';
import styles from './visit-type-selector.scss';
import { useRecommendedVisitTypes } from '../hooks/useRecommendedVisitTypes';
import { type PatientProgram } from '../../types';
import { InlineNotification } from '@carbon/react';

export interface VisitTypeSelectorProps {
  onChange: (event) => void;
}

export const VisitTypeSelector: React.FC<VisitTypeSelectorProps> = ({ onChange }) => {
  const allVisitTypes = useVisitTypes();

  return (
    <div>
      {allVisitTypes.length == 0 ? (
        <StructuredListSkeleton />
      ) : (
        <VisitTypeSelectorPresentation visitTypes={allVisitTypes} onChange={onChange} />
      )}
    </div>
  );
};

export interface RecommendedVisitTypeSelectorProps {
  onChange: (event) => void;
  patientUuid: string;
  patientProgram: PatientProgram;
  locationUuid: string;
}

/** Recommended visits are specfic to a patient, patient program, and location. */
export const RecommendedVisitTypeSelector: React.FC<RecommendedVisitTypeSelectorProps> = ({
  onChange,
  patientUuid,
  patientProgram,
  locationUuid,
}) => {
  const { t } = useTranslation();
  const { recommendedVisitTypes, error, isLoading } = useRecommendedVisitTypes(
    patientUuid,
    patientProgram?.uuid,
    patientProgram?.program?.uuid,
    locationUuid,
  );

  return (
    <div style={{ marginTop: '0.625rem' }}>
      {isLoading ? (
        <StructuredListSkeleton />
      ) : (
        <VisitTypeSelectorPresentation onChange={onChange} visitTypes={recommendedVisitTypes} />
      )}
      {error && (
        <InlineNotification
          kind="error"
          title={t('failedToLoadRecommendedVisitTypes', 'Failed to load recommended visit types')}></InlineNotification>
      )}
    </div>
  );
};

interface VisitTypeSelectorPresentationProps {
  onChange: (event) => void;
  visitTypes: VisitType[];
}

const VisitTypeSelectorPresentation: React.FC<VisitTypeSelectorPresentationProps> = ({ visitTypes, onChange }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm);

  const searchResults = useMemo(() => {
    if (!isEmpty(debouncedSearchTerm)) {
      return visitTypes.filter(
        (visitType) => visitType.display.toLowerCase().search(debouncedSearchTerm.toLowerCase()) !== -1,
      );
    } else {
      return visitTypes;
    }
  }, [debouncedSearchTerm, visitTypes]);

  const { results } = usePagination(searchResults, 5);

  const defaultVisitType = results?.length === 1 ? results[0].uuid : '';

  return (
    <div
      className={classNames(styles.visitTypeOverviewWrapper, {
        [styles.tablet]: isTablet,
        [styles.desktop]: !isTablet,
      })}>
      <ResponsiveWrapper>
        <Search
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={t('searchForAVisitType', 'Search for a visit type')}
          labelText=""
        />
      </ResponsiveWrapper>
      {results.length ? (
        <RadioButtonGroup
          className={styles.radioButtonGroup}
          defaultSelected={defaultVisitType}
          orientation="vertical"
          onChange={onChange}
          name="radio-button-group">
          {results.map(({ uuid, display, name }) => (
            <RadioButton key={uuid} className={styles.radioButton} id={name} labelText={display} value={uuid} />
          ))}
        </RadioButtonGroup>
      ) : (
        <Layer>
          <Tile className={styles.tile}>
            <EmptyDataIllustration />
            <p className={styles.content}>
              {t('noVisitTypes', 'There are no visit types to display for this patient')}
            </p>
          </Tile>
        </Layer>
      )}
    </div>
  );
};
