import React, { createContext, useContext, useEffect } from 'react';
import { get } from 'lodash-es';

export interface PatternRule {
  path: string;
  pattern: string;
  message: string;
  /** `pass` logs and accepts the value; `throw` rethrows the SyntaxError so the save is blocked. */
  onInvalidPattern: 'pass' | 'throw';
}

export interface PatternRuleRegistry {
  register(rule: PatternRule): () => void;
  getRules(): Array<PatternRule>;
}

export function createPatternRuleRegistry(): PatternRuleRegistry {
  const rules: Array<PatternRule> = [];

  return {
    register(rule) {
      rules.push(rule);
      return () => {
        const index = rules.indexOf(rule);
        if (index !== -1) {
          rules.splice(index, 1);
        }
      };
    },
    getRules: () => [...rules],
  };
}

const noopRegistry: PatternRuleRegistry = {
  register: () => () => {},
  getRules: () => [],
};

const PatternRulesContext = createContext<PatternRuleRegistry>(noopRegistry);

export const PatternRulesProvider: React.FC<{ registry: PatternRuleRegistry; children: React.ReactNode }> = ({
  registry,
  children,
}) => <PatternRulesContext.Provider value={registry}>{children}</PatternRulesContext.Provider>;

/**
 * Registers a pattern rule while the calling component is mounted. The effect has no dependency array on purpose:
 * the rule is unregistered and registered again on every commit, which copies how Formik's `<Field validate>`
 * registered its validator on every render. The rules then follow the form order, and the snackbar lists the
 * pattern errors in the same order as before.
 */
export function usePatternRule(rule: PatternRule | null): void {
  const registry = useContext(PatternRulesContext);

  useEffect(() => {
    if (!rule) {
      return;
    }
    return registry.register(rule);
  });
}

export function findPatternViolations(
  values: object,
  rules: Array<PatternRule>,
): Array<{ path: string; message: string }> {
  const violations: Array<{ path: string; message: string }> = [];

  for (const { path, pattern, message, onInvalidPattern } of rules) {
    const value = get(values, path);
    if (typeof value !== 'string' || value === '') {
      continue;
    }

    try {
      if (!new RegExp(pattern).test(value)) {
        violations.push({ path, message });
      }
    } catch (error) {
      if (onInvalidPattern === 'throw') {
        throw error;
      }
      console.error('Invalid regex pattern:', pattern);
    }
  }

  return violations;
}
