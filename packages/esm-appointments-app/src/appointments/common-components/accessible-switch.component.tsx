import React, { useLayoutEffect, useRef } from 'react';
import { Switch, type SwitchProps } from '@carbon/react';

/**
 * Accessible wrapper for Carbon's Switch component that removes redundant title attributes.
 *
 * This component wraps Carbon's Switch and removes the title attribute that Carbon
 * automatically adds to the internal span element, which creates redundant information
 * for screen readers.
 */
export const AccessibleSwitch: React.FC<SwitchProps> = (props) => {
  const ref = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const span = ref.current?.querySelector('span[title]');
    if (span) {
      span.removeAttribute('title');
    }
  }, []);

  return <Switch ref={ref} {...props} />;
};
