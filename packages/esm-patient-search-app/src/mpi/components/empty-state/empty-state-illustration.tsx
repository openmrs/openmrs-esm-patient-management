import React from 'react';
import baseStyles from '../../../patient-search-page/patient-search-lg.scss';
import styles from './empty-state-illustration.scss';
import { Layer, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import UserSearchIllustration from '../user-search-illustration';

export const EmptySearchResultsIllustrationAlt: React.FC<{}> = () => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tile className={`${baseStyles.emptySearchResultsTile}`}>
        <UserSearchIllustration />
        <p className={baseStyles.emptyResultText}>
          {t('noPatientChartsFoundMessage', 'Sorry, no patient charts have been found')}
        </p>
        <p className={baseStyles.actionText}>
          <span>{t('trySearchWithPatientUniqueID', "Try searching with the patient's unique ID number")}</span>
          <br />
          <span>{t('orPatientName', "OR the patient's name(s)")}</span>
        </p>
      </Tile>
    </Layer>
  );
};
