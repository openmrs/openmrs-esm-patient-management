import React, { useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash-es/isEmpty';
import { useTranslation } from 'react-i18next';
import {
  InlineNotification,
  Layer,
  RadioButton,
  RadioButtonGroup,
  Search,
  StructuredListSkeleton,
  Tile,
} from '@carbon/react';
import { ResponsiveWrapper, useDebounce, useLayoutType, useVisitTypes, type VisitType } from '@openmrs/esm-framework';
import EmptyDataIllustration from '../empty-data-illustration.component';
import styles from './visit-type-selector.scss';
import { useRecommendedVisitTypes } from '../hooks/useRecommendedVisitTypes';
import { type PatientProgram } from '../../types';

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

const MAX_RESULTS = 5;

const VisitTypeSelectorPresentation: React.FC<VisitTypeSelectorPresentationProps> = ({ visitTypes, onChange }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [selectedVisitType, setSelectedVisitType] = useState<string>();

  const results = useMemo(() => {
    if (!isEmpty(debouncedSearchTerm)) {
      return visitTypes.filter(
        (visitType) => visitType.display.toLowerCase().search(debouncedSearchTerm.toLowerCase()) !== -1,
      );
    } else {
      return visitTypes;
    }
  }, [debouncedSearchTerm, visitTypes]);

  const truncatedResults = results.slice(0, MAX_RESULTS);

  useEffect(() => {
    if (results.length > 0) {
      onChange(results[0].uuid);
      setSelectedVisitType(results[0].uuid);
    }
  }, [results]);

  return (
    <div
      className={classNames(styles.visitTypeOverviewWrapper, {
        [styles.tablet]: isTablet,
        [styles.desktop]: !isTablet,
      })}>
      {truncatedResults.length < visitTypes.length ? (
        <ResponsiveWrapper>
          <Search
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('searchForAVisitType', 'Search for a visit type')}
            labelText=""
          />
        </ResponsiveWrapper>
      ) : null}
      {truncatedResults.length ? (
        <RadioButtonGroup
          className={styles.radioButtonGroup}
          defaultSelected={results[0].uuid}
          orientation="vertical"
          onChange={(visitType) => {
            setSelectedVisitType(visitType);
            onChange(visitType);
          }}
          name="radio-button-group"
          valueSelected={selectedVisitType}>
          {truncatedResults.map(({ uuid, display, name }) => (
            <RadioButton key={uuid} className={styles.radioButton} id={name} labelText={display} value={uuid} />
          ))}
          {/* TODO: This is supposed to paginate. Right now it just shows the user a truncated list
                with no indication that the list is truncated. */}
        </RadioButtonGroup>
      ) : (
        <Layer>
          <Tile className={styles.tile}>
            <EmptyDataIllustration />
            <p className={styles.content}>
              {t('noVisitTypesMatchingSearch', 'There are no visit types matching this search text')}
            </p>
          </Tile>
        </Layer>
      )}
    </div>
  );
};
