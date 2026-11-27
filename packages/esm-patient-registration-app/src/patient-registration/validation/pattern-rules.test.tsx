import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import {
  createPatternRuleRegistry,
  findPatternViolations,
  PatternRulesProvider,
  usePatternRule,
  type PatternRule,
} from './pattern-rules';

const rule = (pattern: string, onInvalidPattern: PatternRule['onInvalidPattern'] = 'pass'): PatternRule => ({
  path: 'obs.x',
  pattern,
  message: 'Invalid Input',
  onInvalidPattern,
});

function Field({ rule }: { rule: PatternRule | null }) {
  usePatternRule(rule);
  return null;
}

describe('usePatternRule', () => {
  it('registers while mounted and unregisters on unmount', () => {
    const registry = createPatternRuleRegistry();
    const { unmount } = render(
      <PatternRulesProvider registry={registry}>
        <Field rule={rule('^\\d+$')} />
      </PatternRulesProvider>,
    );

    expect(registry.getRules()).toEqual([rule('^\\d+$')]);
    unmount();
    expect(registry.getRules()).toEqual([]);
  });

  it('registers nothing for null', () => {
    const registry = createPatternRuleRegistry();
    render(
      <PatternRulesProvider registry={registry}>
        <Field rule={null} />
      </PatternRulesProvider>,
    );

    expect(registry.getRules()).toEqual([]);
  });

  it('does not throw without a provider', () => {
    expect(() => render(<Field rule={rule('^\\d+$')} />)).not.toThrow();
  });
});

describe('findPatternViolations', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports a value that does not match', () => {
    expect(findPatternViolations({ obs: { x: 'ab' } }, [rule('^\\d+$')])).toEqual([
      { path: 'obs.x', message: 'Invalid Input' },
    ]);
  });

  it('ignores empty and missing values', () => {
    expect(findPatternViolations({ obs: { x: '' } }, [rule('^\\d+$')])).toEqual([]);
    expect(findPatternViolations({ obs: {} }, [rule('^\\d+$')])).toEqual([]);
  });

  it('passes an invalid pattern when told to pass', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(findPatternViolations({ obs: { x: 'ab' } }, [rule('(', 'pass')])).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith('Invalid regex pattern:', '(');
  });

  it('throws on an invalid pattern when told to throw', () => {
    expect(() => findPatternViolations({ obs: { x: 'ab' } }, [rule('(', 'throw')])).toThrow(SyntaxError);
  });
});
