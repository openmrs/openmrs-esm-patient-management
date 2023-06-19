import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TextInput, Layer } from '@carbon/react';
import SelectionTick from './selection-tick.component';

interface ComboInputProps {
  entries: Array<string>;
  name: string;
  fieldProps: {
    value: string;
    labelText: string;
    helperText: string;
    [x: string]: any;
  };
  handleInputChange: (newValue: string) => void;
  handleSelection: (newSelection) => void;
}

const ComboInput: React.FC<ComboInputProps> = ({ entries, fieldProps, handleInputChange, handleSelection }) => {
  const { value = '' } = fieldProps;
  const [showEntries, setShowEntries] = useState(false);
  const comboInputRef = useRef(null);
  const inputRef = useRef(null);

  const filteredEntries = useMemo(() => {
    if (!entries) {
      return [];
    }
    if (!value) {
      return entries;
    }
    return entries.filter((entry) => entry.toLowerCase().includes(value.toLowerCase()));
  }, [entries, value]);

  const handleOptionClick = (newSelection) => {
    handleSelection(newSelection);
    setShowEntries(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (comboInputRef.current && !comboInputRef.current.contains(event.target)) {
        setShowEntries(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ marginBottom: '1rem' }} ref={comboInputRef}>
      <Layer>
        <TextInput
          {...fieldProps}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowEntries(true)}
          autoComplete={'off'}
        />
      </Layer>
      <div
        style={{
          position: 'relative',
        }}>
        {showEntries && (
          <div id="downshift-1-menu" className="cds--list-box__menu" role="listbox" aria-label="Choose an item">
            {filteredEntries.map((entry) => (
              <div
                id="downshift-1-item-0"
                role="option"
                className="cds--list-box__menu-item"
                tabIndex={-1}
                aria-selected="true"
                onClick={() => handleOptionClick(entry)}>
                <div
                  className={`cds--list-box__menu-item__option ${
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

// cds--list-box__menu-item--highlighted
