import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { Layer, Search, RadioButtonGroup, RadioButton, Tile } from '@carbon/react';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import styles from './base-visit-type.scss';
import EmptyState from '../../empty-state/empty-state.component';

interface BaseVisitTypeProps {
  onChange: (event) => void;
  patientUuid: string;
  visitTypes;
}

const BaseVisitType: React.FC<BaseVisitTypeProps> = ({ onChange, visitTypes }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState<string>('');

  const searchResults = useMemo(() => {
    if (searchTerm) {
      return visitTypes.filter((visitType) => visitType.display.toLowerCase().search(searchTerm.toLowerCase()) !== -1);
    } else {
      return visitTypes;
    }
  }, [searchTerm, visitTypes]);

  const handleSearch = React.useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  const { results } = usePagination<{ uuid: string; display: string; name: string }>(searchResults, 5);

  return (
    <div className={`${styles.visitTypeOverviewWrapper} ${isTablet ? styles.tablet : styles.desktop}`}>
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

        {results.length > 0 && (
          <RadioButtonGroup
            className={styles.radioButtonGroup}
            defaultSelected="default-selected"
            orientation="vertical"
            onChange={onChange}
            name="radio-button-group"
            valueSelected="default-selected">
            {results.map(({ uuid, display, name }) => (
              <RadioButton key={uuid} className={styles.radioButton} id={name} labelText={display} value={uuid} />
            ))}
          </RadioButtonGroup>
        )}
        {!results.length && (
          <p className={styles.emptyVisitType}>
            {t('noMatchingVisitTypeFound', `No visit type found matching ${searchTerm}`)}
          </p>
        )}
      </>
    </div>
  );
};

export default BaseVisitType;
