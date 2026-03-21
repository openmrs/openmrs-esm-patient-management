import '@testing-library/jest-dom';
import type { ReactNode } from 'react';

jest.mock('@openmrs/esm-framework', () => {
  const actual = jest.requireActual('@openmrs/esm-framework');

  if (!actual.TableBatchActions) {
    Object.defineProperty(actual, 'TableBatchActions', {
      value: ({ children }: { children?: ReactNode }) => children ?? null,
      configurable: true,
      writable: true,
    });
  }

  return actual;
});

// Prevent single-spa from emitting warnings / touching navigation during unit tests.
jest.mock('single-spa', () => ({
  navigateToUrl: jest.fn(),
}));

declare global {
  interface Window {
    openmrsBase: string;
    spaBase: string;
  }
}

window.openmrsBase = '/openmrs';
window.spaBase = '/spa';
window.getOpenmrsSpaBase = () => '/openmrs/spa/';
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLFormElement.prototype.requestSubmit = jest.fn();
window.matchMedia = jest.fn().mockImplementation(() => {
  return {
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
});

// Mock ResizeObserver for Carbon components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
