import { describe, expect, it } from 'vitest';
import { prepareDataForValidation } from 'formik';
import { emptyStringsToUndefined } from './empty-strings-to-undefined';

describe('emptyStringsToUndefined', () => {
  it('matches Formik prepareDataForValidation', () => {
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

    expect(emptyStringsToUndefined(input)).toEqual(prepareDataForValidation(input));
  });

  it('keeps Date instances', () => {
    const date = new Date(2020, 1, 1);

    expect(emptyStringsToUndefined({ date }).date).toBe(date);
  });
});
