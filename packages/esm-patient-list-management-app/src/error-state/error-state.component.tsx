import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './error-state.scss';

export interface FetchError extends Error {
  response?: {
    status?: number;
    statusText?: string;
  };
}

export interface ErrorStateProps {
  error: FetchError | Error | null | undefined;
  headerTitle: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, headerTitle }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const response = error && 'response' in error ? (error as FetchError).response : undefined;

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h2>{headerTitle}</h2>
        </div>
        <p className={styles.errorMessage}>
          {t('error', 'Error')} {response?.status ? `${response.status}: ` : ''}
          {response?.statusText ?? error?.message}
        </p>
        <p className={styles.errorCopy}>
          {t(
            'errorCopy',
            'Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above.',
          )}
        </p>
      </Tile>
    </Layer>
  );
};
