import { Button } from 'carbon-components-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './content-switcher.scss';
import { useField } from 'formik';

interface ContentSwitcherProps {
  onToggle: (dobKnown: boolean) => void;
}

const ContentSwitcher: React.FC<ContentSwitcherProps> = ({ onToggle }) => {
  const [dobEstimated] = useField('birthdateEstimated');
  const { t } = useTranslation();
  const dobKnown = !dobEstimated.value;

  return (
    <div className={styles.contentSwitcher}>
      <Button
        kind="ghost"
        size="sm"
        className={`${styles.leftSwitch} ${dobKnown && styles.activeSwitch}`}
        onClick={() => onToggle(true)}>
        {t('dobKnownSwitchText', 'Yes')}
      </Button>
      <Button
        kind="ghost"
        size="sm"
        className={`${styles.rightSwitch} ${!dobKnown && styles.activeSwitch}`}
        onClick={() => onToggle(false)}>
        {t('dobNotKnownSwitchText', 'No')}
      </Button>
    </div>
  );
};

export default ContentSwitcher;
