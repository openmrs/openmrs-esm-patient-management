import React, { useState, useMemo } from 'react';
import styles from './visit-type-overview.scss';
import debounce from 'lodash-es/debounce';
import isEmpty from 'lodash-es/isEmpty';
import { Search, RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { EmptyState } from './empty-state';
import { useTranslation } from 'react-i18next';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';

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
          <Search
            onChange={(event) => handleSearch(event.target.value)}
            placeholder={t('searchForAVisitType', 'Search for a visit type')}
            labelText=""
            light={isTablet}
          />
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
        </>
      ) : (
        <EmptyState displayText={t('visitType', 'Visit type')} headerTitle={t('visitType', 'Visit type')} />
      )}
    </div>
  );
};

export default BaseVisitType;
