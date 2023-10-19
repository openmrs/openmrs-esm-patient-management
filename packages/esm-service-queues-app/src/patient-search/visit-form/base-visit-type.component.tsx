import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import isEmpty from 'lodash-es/isEmpty';
import { Layer, Search, RadioButtonGroup, RadioButton, Tile } from '@carbon/react';
import { useLayoutType, usePagination, VisitType } from '@openmrs/esm-framework';
import EmptyDataIllustration from '../empty-data-illustration.component';
import styles from './base-visit-type.scss';

interface BaseVisitTypeProps {
  onChange: (event) => void;
  patientUuid: string;
  visitTypes: Array<VisitType>;
}

const BaseVisitType: React.FC<BaseVisitTypeProps> = ({ onChange, visitTypes }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState<string>('');

  const searchResults = useMemo(() => {
    if (!isEmpty(searchTerm)) {
      return visitTypes.filter((visitType) => visitType.display.toLowerCase().search(searchTerm.toLowerCase()) !== -1);
    } else {
      return visitTypes;
    }
  }, [searchTerm, visitTypes]);

  const handleSearch = React.useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  const { results, currentPage, goTo } = usePagination(searchResults, 5);

  return (
    <div className={`${styles.visitTypeOverviewWrapper} ${isTablet ? styles.tablet : styles.desktop}`}>
      {results.length ? (
        <>
          {isTablet ? (
            <Layer>
              <Search
                onChange={(event) => handleSearch(event.target.value)}
                placeholder={t('searchForAVisitType', 'Search for a visit type')}
                labelText=""
              />
            </Layer>
          ) : (
            <Search
              onChange={(event) => handleSearch(event.target.value)}
              placeholder={t('searchForAVisitType', 'Search for a visit type')}
              labelText=""
            />
          )}

          <RadioButtonGroup
            className={styles.radioButtonGroup}
            defaultSelected={results?.length === 1 && results[0].uuid}
            orientation="vertical"
            onChange={onChange}
            name="radio-button-group"
            valueSelected={results?.length >= 1 && results[0].uuid}>
            {results.map(({ uuid, display, name }) => (
              <RadioButton key={uuid} className={styles.radioButton} id={name} labelText={display} value={uuid} />
            ))}
          </RadioButtonGroup>
        </>
      ) : (
        <Layer>
          <Tile className={styles.tile}>
            <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
              <h4>{t('visitType', 'Visit Type')}</h4>
            </div>
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

export default BaseVisitType;
