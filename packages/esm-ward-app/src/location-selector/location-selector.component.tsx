import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { IconButton, RadioButton, RadioButtonGroup, RadioButtonSkeleton, Search } from '@carbon/react';
import { type RadioButtonGroupProps } from '@carbon/react/lib/components/RadioButtonGroup/RadioButtonGroup';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  isDesktop,
  ResponsiveWrapper,
  useDebounce,
  useLayoutType,
} from '@openmrs/esm-framework';
import useEmrConfiguration from '../hooks/useEmrConfiguration';
import useLocations from '../hooks/useLocations';
import styles from './location-selector.scss';

interface LocationSelectorProps extends RadioButtonGroupProps {
  paginationSize?: number;
}

export default function LocationSelector({ paginationSize = 15, ...props }: LocationSelectorProps) {
  const { t } = useTranslation();
  const { emrConfiguration, isLoadingEmrConfiguration } = useEmrConfiguration();
  const isTablet = !isDesktop(useLayoutType());
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const filterCriteria: Array<Array<string>> = useMemo(() => {
    const criteria = [];
    if (debouncedSearchTerm) {
      criteria.push(['name:contains', debouncedSearchTerm]);
    }
    if (emrConfiguration) {
      criteria.push(['_tag', emrConfiguration.supportsTransferLocationTag.name]);
    }
    return criteria;
  }, [debouncedSearchTerm, emrConfiguration]);
  const {
    data: locations,
    isLoading,
    totalCount,
    currentPage,
    totalPages,
    goToNext,
    goToPrevious,
  } = useLocations(filterCriteria, paginationSize, !emrConfiguration);

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [setSearchTerm],
  );
  return (
    <div className={styles.locationSelector}>
      <ResponsiveWrapper>
        <Search
          onChange={handleSearch}
          value={searchTerm}
          placeholder={t('searchLocations', 'Search locations')}
          size={isTablet ? 'lg' : 'md'}
        />
      </ResponsiveWrapper>
      {isLoading || isLoadingEmrConfiguration ? (
        <div className={styles.radioButtonGroup}>
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
        </div>
      ) : (
        <ResponsiveWrapper>
          <RadioButtonGroup {...props} className={styles.radioButtonGroup} orientation="vertical">
            {locations?.length > 0 ? (
              locations?.map((location) => (
                <RadioButton key={location.id} labelText={location.name} value={location.id} />
              ))
            ) : (
              <span className={styles.bodyShort01}>{t('noLocationsFound', 'No locations found')}</span>
            )}
          </RadioButtonGroup>
        </ResponsiveWrapper>
      )}
      {totalCount > paginationSize && (
        <div className={styles.pagination}>
          <span className={styles.bodyShort01}>
            {t('showingLocations', '{{start}}-{{end}} of {{count}} locations', {
              start: (currentPage - 1) * paginationSize + 1,
              end: Math.min(currentPage * paginationSize, totalCount),
              count: totalCount,
            })}
          </span>
          <div>
            <IconButton
              className={classNames(styles.button, styles.buttonLeft)}
              disabled={currentPage === 1}
              kind="ghost"
              label={t('previousPage', 'Previous page')}
              onClick={() => goToPrevious()}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              className={styles.button}
              disabled={currentPage >= totalPages}
              kind="ghost"
              label={t('nextPage', 'Next page')}
              onClick={() => goToNext()}>
              <ChevronRightIcon />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
