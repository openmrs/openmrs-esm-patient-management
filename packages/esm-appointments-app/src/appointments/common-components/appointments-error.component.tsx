import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineNotification } from '@carbon/react';
import { ErrorFilled } from '@carbon/react/icons';
import styles from './appointments-error.scss';

interface AppointmentsErrorProps {
  error: Error | undefined;
  title?: string;
  subtitle?: string;
}

/**
 * Standardized error component for displaying appointment data fetch failures.
 * Shows a clear error message with icon and allows users to retry if needed.
 */
const AppointmentsError: React.FC<AppointmentsErrorProps> = ({
  error,
  title = 'Unable to load',
  subtitle = 'An error occurred while fetching appointments',
}) => {
  const { t } = useTranslation();

  if (!error) {
    return null;
  }

  const errorMessage = error?.message || t('unknownError', 'An unknown error occurred');

  return (
    <div className={styles.errorContainer} data-testid="appointments-error">
      <InlineNotification
        kind="error"
        title={t(title, title)}
        subtitle={t(subtitle, `${subtitle}: ${errorMessage}`)}
        hideCloseButton
        style={{ marginBottom: '1rem' }}
      />
    </div>
  );
};

export default AppointmentsError;
