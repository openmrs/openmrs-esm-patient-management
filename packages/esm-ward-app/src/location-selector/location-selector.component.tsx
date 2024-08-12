import React, { useCallback, useMemo, useState } from 'react';
import styles from './location-selector.scss';
import useLocations from '../hooks/useLocations';
import { RadioButton, Search, RadioButtonGroup, RadioButtonSkeleton, IconButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  isDesktop,
  ResponsiveWrapper,
  useDebounce,
  useLayoutType,
} from '@openmrs/esm-framework';
import classNames from 'classnames';
import type { RadioButtonGroupProps } from '@carbon/react/lib/components/RadioButtonGroup/RadioButtonGroup';
import useEmrConfiguration from '../hooks/useEmrConfiguration';

const size = 5;

interface LocationSelectorProps extends RadioButtonGroupProps {}

export default function LocationSelector(props: LocationSelectorProps) {
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
      criteria.push(['_tag', emrConfiguration.supportsTransferLocationTag.display]);
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
              onClick={() => handlePageChange({ page: page - 1 })}
              hasIconOnly
              renderIcon={ChevronLeftIcon}
              kind="ghost"
              iconDescription={t('previousPage', 'Previous page')}
            />
            <IconButton
              className={styles.button}
              disabled={page * size >= totalLocations}
              onClick={() => handlePageChange({ page: page + 1 })}
              hasIconOnly
              renderIcon={ChevronRightIcon}
              kind="ghost"
              iconDescription={t('nextPage', 'Next page')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
