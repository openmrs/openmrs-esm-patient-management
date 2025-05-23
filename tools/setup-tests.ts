import '@testing-library/jest-dom';

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
