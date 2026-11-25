import { describe, expect, it } from 'vitest';
import { emptyStringsToUndefined } from './empty-strings-to-undefined';

describe('emptyStringsToUndefined', () => {
  it('turns empty strings into undefined, as Formik prepareDataForValidation does', () => {
    const input = {
      name: '',
      nested: { a: '', b: 'x', deeper: { c: '' } },
      list: [{ a: '', b: 1 }, '', 'y', ['', 'z']],
      strings: ['', 'a'],
      date: new Date(2020, 1, 1),
      nothing: null,
      zero: 0,
      no: false,
    };

    expect(emptyStringsToUndefined(input)).toStrictEqual({
      name: undefined,
      nested: { a: undefined, b: 'x', deeper: { c: undefined } },
      list: [{ a: undefined, b: 1 }, undefined, 'y', [undefined, 'z']],
      strings: [undefined, 'a'],
      date: new Date(2020, 1, 1),
      nothing: null,
      zero: 0,
      no: false,
    });
  });

  it('keeps Date instances', () => {
    const date = new Date(2020, 1, 1);

    expect(emptyStringsToUndefined({ date }).date).toBe(date);
  });
});
