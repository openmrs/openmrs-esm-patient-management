import '@testing-library/jest-dom';

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
