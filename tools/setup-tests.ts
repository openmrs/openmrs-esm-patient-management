import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Prevent single-spa from emitting warnings / touching navigation during unit tests.
vi.mock('single-spa', () => ({
  navigateToUrl: vi.fn(),
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
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLFormElement.prototype.requestSubmit = vi.fn();
window.matchMedia = vi.fn().mockImplementation(() => {
  return {
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
});

// Mock ResizeObserver for Carbon components
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};
