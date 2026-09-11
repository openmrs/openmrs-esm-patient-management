import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkipLogicCleanup } from './skip-logic-cleanup.component';

describe('SkipLogicCleanup component', () => {
  const mockConfig: any = {
    sections: ['demographics', 'testSection'],
    sectionDefinitions: [
      {
        id: 'demographics',
        fields: ['referred', 'hiddenAttribute'],
      },
      {
        id: 'testSection',
        hideIf: { fieldId: 'referred', notEquals: 'Yes' },
        fields: ['testObsField'],
      },
    ],
    fieldDefinitions: [
      { id: 'referred', type: 'person attribute', uuid: 'ref-uuid' },
      {
        id: 'hiddenAttribute',
        type: 'person attribute',
        uuid: 'hidden-attr-uuid',
        hideIf: { fieldId: 'referred', notEquals: 'Yes' },
      },
      {
        id: 'testObsField',
        type: 'obs',
        uuid: 'obs-uuid',
      },
    ],
  };

  it('clears values and errors of fields that are hidden', () => {
    const setFieldValue = vi.fn();
    const setFieldError = vi.fn();
    const setFieldTouched = vi.fn();

    const values: any = {
      attributes: {
        'ref-uuid': 'No', // Hides both hiddenAttribute and testSection
        'hidden-attr-uuid': 'stale attribute value',
      },
      obs: {
        'obs-uuid': 'stale obs value',
      },
    };

    render(
      <SkipLogicCleanup
        values={values}
        config={mockConfig}
        setFieldValue={setFieldValue}
        setFieldError={setFieldError}
        setFieldTouched={setFieldTouched}
      />,
    );

    expect(setFieldValue).toHaveBeenCalledWith('attributes.hidden-attr-uuid', '');
    expect(setFieldError).toHaveBeenCalledWith('attributes.hidden-attr-uuid', undefined);
    expect(setFieldTouched).toHaveBeenCalledWith('attributes.hidden-attr-uuid', false);

    expect(setFieldValue).toHaveBeenCalledWith('obs.obs-uuid', '');
    expect(setFieldError).toHaveBeenCalledWith('obs.obs-uuid', undefined);
    expect(setFieldTouched).toHaveBeenCalledWith('obs.obs-uuid', false);
  });

  it('does not clear fields when they are visible', () => {
    const setFieldValue = vi.fn();

    const values: any = {
      attributes: {
        'ref-uuid': 'Yes',
        'hidden-attr-uuid': 'valid attribute value',
      },
      obs: {
        'obs-uuid': 'valid obs value',
      },
    };

    render(<SkipLogicCleanup values={values} config={mockConfig} setFieldValue={setFieldValue} />);

    expect(setFieldValue).not.toHaveBeenCalled();
  });
});
