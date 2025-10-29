import React, { useCallback, useState, useRef, useEffect, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button, Search } from '@carbon/react';
import styles from './patient-search-bar.scss';

interface PatientSearchBarProps {
  buttonProps?: Object;
  initialSearchTerm?: string;
  onChange?: (searchTerm) => void;
  onClear: () => void;
  onSubmit: (searchTerm) => void;
  isCompact?: boolean;
}

const PatientSearchBar = React.forwardRef<HTMLInputElement, React.PropsWithChildren<PatientSearchBarProps>>(
  ({ buttonProps, initialSearchTerm = '', onChange, onClear, onSubmit, isCompact }, ref) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [isInputClicked, setIsInputClicked] = useState(false);
    const responsiveSize = isCompact ? 'sm' : 'lg';
    const inputRef = useRef(null);
    const isSubmitFromButton = useRef(false);

    useImperativeHandle(ref, () => inputRef.current!);

    const handleChange = useCallback(
      (value: string) => {
        setSearchTerm(value);
        onChange?.(value);
      },
      [onChange],
    );

    const handleSubmit = useCallback(
      (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (searchTerm && searchTerm.trim()) {
          onSubmit(searchTerm.trim());
        } else if (isSubmitFromButton.current) {
          // Only set input clicked state if the submit was triggered by button click
          setIsInputClicked(true);
          inputRef.current.focus();
          // Reset the flag
          isSubmitFromButton.current = false;
        } else {
          // If it's from Enter key, just submit without visual effect
          isSubmitFromButton.current = false;
        }
      },
      [onSubmit, searchTerm],
    );

    const handleButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      isSubmitFromButton.current = true;
    }, []);

    useEffect(() => {
      if (isInputClicked) {
        const timeout = setTimeout(() => {
          setIsInputClicked(false);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }, [isInputClicked]);

    return (
      <form onSubmit={handleSubmit} className={styles.searchArea}>
        {/* data-tutorial-target attribute is essential for joyride in onboarding app ! */}
        <Search
          autoFocus
          className={classNames(styles.patientSearchInput, { [styles.darkPlaceholder]: isInputClicked })}
          closeButtonLabelText={t('clearSearch', 'Clear')}
          data-testid="patientSearchBar"
          data-tutorial-target="patient-search-bar"
          labelText={t('searchForPatient', 'Search for a patient by name or identifier number')}
          onChange={(event) => handleChange(event.target.value)}
          onClear={onClear}
          placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
          ref={inputRef}
          size={responsiveSize}
          value={searchTerm}
        />
        <Button kind="secondary" onMouseDown={handleButtonClick} {...buttonProps} size={responsiveSize} type="submit">
          {t('search', 'Search')}
        </Button>
      </form>
    );
  },
);

export default PatientSearchBar;
