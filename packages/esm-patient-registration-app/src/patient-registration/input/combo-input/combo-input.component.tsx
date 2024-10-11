import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { TextInput, Layer } from '@carbon/react';
import SelectionTick from './selection-tick.component';
import styles from '../input.scss';
import { Controller } from 'react-hook-form';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { type FormValues } from '../../patient-registration.types';
import { usePatientRegistrationContext } from '../../patient-registration-hooks';

interface ComboInputProps {
  entries: Array<string>;
  name: keyof FormValues;
  handleInputChange: (newValue: string) => void;
  handleSelection: (newSelection) => void;
  required: boolean;
  labelText: string;
}

const ComboInput: React.FC<ComboInputProps> = ({
  entries,
  name,
  labelText,
  required,
  handleInputChange,
  handleSelection,
}) => {
  const [highlightedEntry, setHighlightedEntry] = useState(-1);
  const [showEntries, setShowEntries] = useState(false);
  const comboInputRef = useRef(null);
  const { control, setValue, watch } = usePatientRegistrationContext();
  const value = watch(name) ?? '';

  const handleFocus = useCallback(() => {
    setShowEntries(true);
    setHighlightedEntry(-1);
  }, [setShowEntries, setHighlightedEntry]);

  const filteredEntries = useMemo(() => {
    if (!entries) {
      return [];
    }
    if (!value) {
      return entries;
    }
    return entries.filter((entry) => entry.toLowerCase().includes((value as string).toLowerCase()));
  }, [entries, value]);

  const handleOptionClick = useCallback(
    (newSelection: string, e: KeyboardEvent = null) => {
      e?.preventDefault();
      handleSelection(newSelection);
      setShowEntries(false);
    },
    [handleSelection, setShowEntries],
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      const totalResults = filteredEntries.length ?? 0;

      if (e.key === 'Tab') {
        setShowEntries(false);
        setHighlightedEntry(-1);
      }

      if (e.key === 'ArrowUp') {
        setHighlightedEntry((prev) => Math.max(-1, prev - 1));
      } else if (e.key === 'ArrowDown') {
        setHighlightedEntry((prev) => Math.min(totalResults - 1, prev + 1));
      } else if (e.key === 'Enter' && highlightedEntry > -1) {
        handleOptionClick(filteredEntries[highlightedEntry], e);
      }
    },
    [highlightedEntry, handleOptionClick, filteredEntries, setHighlightedEntry, setShowEntries],
  );

  useEffect(() => {
    const listener = (e) => {
      if (!comboInputRef.current.contains(e.target as Node)) {
        setShowEntries(false);
        setHighlightedEntry(-1);
      }
    };
    window.addEventListener('click', listener);
    return () => {
      window.removeEventListener('click', listener);
    };
  });

  return (
    <div className={styles.comboInput} ref={comboInputRef}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error, isTouched } }) => (
          <>
            <Layer>
              <TextInput
                {...field}
                onChange={(e) => {
                  setHighlightedEntry(-1);
                  handleInputChange(e.target.value);
                }}
                labelText={labelText}
                onFocus={handleFocus}
                autoComplete={'off'}
                onKeyDown={handleKeyPress}
                invalid={Boolean(isTouched && error?.message)}
                invalidText={error?.message}
                required={required}
              />
            </Layer>
            <div className={styles.comboInputEntries}>
              {showEntries && (
                <div className="cds--combo-box cds--list-box cds--list-box--expanded">
                  <div id="downshift-1-menu" className="cds--list-box__menu" role="listbox">
                    {filteredEntries.map((entry, indx) => (
                      <div
                        className={classNames('cds--list-box__menu-item', {
                          'cds--list-box__menu-item--highlighted': indx === highlightedEntry,
                        })}
                        key={indx}
                        id="downshift-1-item-0"
                        role="option"
                        tabIndex={-1}
                        aria-selected="true"
                        onClick={() => handleOptionClick(entry)}>
                        <div
                          className={classNames('cds--list-box__menu-item__option', styles.comboInputItemOption, {
                            'cds--list-box__menu-item--active': entry === value,
                          })}>
                          {entry}
                          {entry === value && <SelectionTick />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      />
    </div>
  );
};

export default ComboInput;
