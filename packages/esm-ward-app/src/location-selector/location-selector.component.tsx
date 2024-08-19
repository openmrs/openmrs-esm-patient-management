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

interface LocationSelectorProps extends RadioButtonGroupProps {}

export default function LocationSelector(props: LocationSelectorProps) {
  const size = 5;
  const { t } = useTranslation();
  const { emrConfiguration, isLoadingEmrConfiguration } = useEmrConfiguration();
  const isTablet = !isDesktop(useLayoutType());
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [page, setPage] = useState(1);
  const filterCriteria: Array<Array<string>> = useMemo(() => {
    const criteria = [];
    if (debouncedSearchTerm) {
      criteria.push(['name:contains', debouncedSearchTerm]);
    }
    criteria.push(['_count', size.toString()]);
    if (emrConfiguration) {
      criteria.push(['_tag', emrConfiguration.supportsTransferLocationTag.name]);
    }
    if (page > 1) {
      criteria.push(['_getpagesoffset', ((page - 1) * size).toString()]);
    }
    return criteria;
  }, [debouncedSearchTerm, page, emrConfiguration]);
  const { locations, isLoading, totalLocations } = useLocations(filterCriteria, !emrConfiguration);

  const handlePageChange = useCallback(
    ({ page: newPage }) => {
      setPage(newPage);
    },
    [setPage, page],
  );
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
      {totalLocations > 5 && (
        <div className={styles.pagination}>
          <span className={styles.bodyShort01}>
            {t('showingLocations', '{{start}}-{{end}} of {{count}} locations', {
              start: (page - 1) * size + 1,
              end: Math.min(page * size, totalLocations),
              count: totalLocations,
            })}
          </span>
          <div>
            <IconButton
              className={classNames(styles.button, styles.buttonLeft)}
              disabled={page === 1}
              kind="ghost"
              label={t('previousPage', 'Previous page')}
              onClick={() => handlePageChange({ page: page - 1 })}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              className={styles.button}
              disabled={page * size >= totalLocations}
              kind="ghost"
              label={t('nextPage', 'Next page')}
              onClick={() => handlePageChange({ page: page + 1 })}>
              <ChevronRightIcon />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
