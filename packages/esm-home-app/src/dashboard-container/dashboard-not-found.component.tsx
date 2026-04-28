import React from 'react';
import { isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { Layer, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';

import styles from './dashboard-not-found.scss';
import classNames from 'classnames';
import { type HomeConfig } from '../config-schema';

export const DashboardNotFound = () => {
  const layout = useLayoutType();
  const { leftNavMode } = useConfig<HomeConfig>();
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  return (
    <div className={styles.homePageWrapper}>
      <section
        className={classNames([
          isDesktop(layout) ? styles.dashboardContainer : styles.dashboardContainerTablet,
          leftNavMode == 'normal' ? styles.hasLeftNav : '',
        ])}>
        <Layer>
          <Tile className={styles.notFoundTile}>
            <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
              <h1>{t('pageNotFound', 'Page not found')}</h1>
            </div>
            <div className={styles.notFoundContent}>
              <p className={styles.errorCode}>404</p>
              <p className={styles.errorMessage}>
                {t('dashboardNotFound', 'The dashboard you are looking for does not exist.')}
              </p>
              <p className={styles.errorDescription}>
                {t(
                  'dashboardNotFoundDescription',
                  'The page you requested could not be found. It may have been moved, deleted, or the configured dashboard does not exist.',
                )}
              </p>
              <p className={styles.errorDescription}>
                {t(
                  'contactAdministrator',
                  'Please try using the left navigation menu links. If the issue persists, contact your system administrator.',
                )}
              </p>
            </div>
          </Tile>
        </Layer>
      </section>
    </div>
  );
};
