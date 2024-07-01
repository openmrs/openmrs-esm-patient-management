import { cleanup } from '@testing-library/react';
import { updateValueInSessionStorage } from './helpers';

describe('Testing updateValueInSessionStorage', () => {
  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
  });
  it('should save value in the session storage if valid value is passed', () => {
    updateValueInSessionStorage('key', 'value');
    expect(sessionStorage.getItem('key')).toBe('value');
  });

  it('should delete the key of the value passed is null or undefined', () => {
    updateValueInSessionStorage('key1', 'v1');
    expect(sessionStorage.getItem('key1')).toBe('v1');
    updateValueInSessionStorage('key1', null);
    expect(sessionStorage.getItem('key1')).toBe(null);

    updateValueInSessionStorage('key2', 'v2');
    expect(sessionStorage.getItem('key2')).toBe('v2');
    updateValueInSessionStorage('key2', undefined);
    expect(sessionStorage.getItem('key2')).toBe(null);
  });
});
