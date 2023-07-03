import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TextInput, Layer } from '@carbon/react';
import SelectionTick from './selection-tick.component';
import styles from '../input.scss';

interface ComboInputProps {
  entries: Array<string>;
  name: string;
  fieldProps: {
    value: string;
    labelText: string;
    [x: string]: any;
  };
  handleInputChange: (newValue: string) => void;
  handleSelection: (newSelection) => void;
}

const ComboInput: React.FC<ComboInputProps> = ({ entries, fieldProps, handleInputChange, handleSelection }) => {
  const [highlightedEntry, setHighlightedEntry] = useState(-1);
  const { value = '' } = fieldProps;
  const [showEntries, setShowEntries] = useState(false);
  const comboInputRef = useRef(null);

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
    return entries.filter((entry) => entry.toLowerCase().includes(value.toLowerCase()));
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
      <Layer>
        <TextInput
          {...fieldProps}
          onChange={(e) => {
            setHighlightedEntry(-1);
            handleInputChange(e.target.value);
          }}
          onFocus={handleFocus}
          autoComplete={'off'}
          onKeyDown={handleKeyPress}
        />
      </Layer>
      <div className={styles.comboInputEntries}>
        {showEntries && (
          <div id="downshift-1-menu" className="cds--list-box__menu" role="listbox">
            {filteredEntries.map((entry, indx) => (
              <div
                key={indx}
                id="downshift-1-item-0"
                role="option"
                className={`cds--list-box__menu-item ${
                  indx === highlightedEntry && 'cds--list-box__menu-item--highlighted'
                }`}
                tabIndex={-1}
                aria-selected="true"
                onClick={() => handleOptionClick(entry)}>
                <div
                  className={`cds--list-box__menu-item__option ${styles.comboInputItemOption} ${
                    entry === value && 'cds--list-box__menu-item--active'
                  }`}>
                  {entry}
                  {entry === value && <SelectionTick />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboInput;
