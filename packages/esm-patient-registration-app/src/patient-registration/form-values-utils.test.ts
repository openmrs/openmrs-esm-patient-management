import { describe, expect, it } from 'vitest';
import { getLeafPaths, keepUnchangedObjects, removeUndefinedLeaves } from './form-values-utils';

describe('getLeafPaths', () => {
  it('lists every leaf, as Formik setNestedObjectValues marks them touched', () => {
    const values = {
      givenName: 'John',
      middleName: '',
      birthdate: new Date('1990-01-01'),
      deathDate: null,
      isDead: false,
      identifiers: {
        nationalId: { required: true, identifierValue: '123' },
        passportId: { required: false, identifierValue: '' },
      },
      relationships: [
        { relatedPersonUuid: 'a', relationshipType: 'x' },
        { relatedPersonUuid: 'b', relationshipType: 'y' },
      ],
      address: { city: 'Nairobi', country: '' },
      attributes: {},
      tags: ['one', 'two'],
    };

    // The leaves of Formik 2.4.6 `setNestedObjectValues(values, true)` for the same values.
    expect(getLeafPaths(values).sort()).toEqual(
      [
        'givenName',
        'middleName',
        'birthdate',
        'deathDate',
        'isDead',
        'identifiers.nationalId.required',
        'identifiers.nationalId.identifierValue',
        'identifiers.passportId.required',
        'identifiers.passportId.identifierValue',
        'relationships.0.relatedPersonUuid',
        'relationships.0.relationshipType',
        'relationships.1.relatedPersonUuid',
        'relationships.1.relationshipType',
        'address.city',
        'address.country',
        'attributes',
        'tags.0',
        'tags.1',
      ].sort(),
    );
  });
});

describe('removeUndefinedLeaves', () => {
  it('removes undefined leaves and keeps empty strings, null and Dates', () => {
    const date = new Date('1990-01-01');
    const result = removeUndefinedLeaves({
      a: undefined,
      b: '',
      c: null,
      d: date,
      e: { f: undefined, g: 1 },
      h: [undefined, 1],
    });

    expect(result).toEqual({ b: '', c: null, d: date, e: { g: 1 }, h: [undefined, 1] });
    expect('a' in result).toBe(false);
    expect('f' in result.e).toBe(false);
    expect(result.d).toBe(date);
  });
});

describe('keepUnchangedObjects', () => {
  const makeValues = () => ({
    givenName: 'John',
    birthdate: new Date('1990-01-01'),
    address: { cityVillage: 'Recife', country: 'Brazil' },
    identifiers: { ssn: { identifierValue: '123', preferred: false } },
    relationships: [
      { uuid: 'rel-1', relationshipType: 'a' },
      { uuid: 'rel-2', relationshipType: 'b' },
    ],
  });

  it('returns the previous object when nothing changed', () => {
    const previous = keepUnchangedObjects(undefined, makeValues());
    expect(keepUnchangedObjects(previous, makeValues())).toBe(previous);
  });

  it('keeps unchanged subtrees and gives a new identity only along the changed path', () => {
    const previous = keepUnchangedObjects(undefined, makeValues());
    const next = makeValues();
    next.identifiers.ssn.identifierValue = '456';

    const result = keepUnchangedObjects(previous, next);

    expect(result).toEqual(next);
    expect(result).not.toBe(previous);
    expect(result.identifiers).not.toBe(previous.identifiers);
    expect(result.identifiers.ssn).not.toBe(previous.identifiers.ssn);
    expect(result.address).toBe(previous.address);
    expect(result.relationships).toBe(previous.relationships);
    expect(result.birthdate).toBe(previous.birthdate);
  });

  it('keeps unchanged array items and replaces the changed one', () => {
    const previous = keepUnchangedObjects(undefined, makeValues());
    const next = makeValues();
    next.relationships[1].relationshipType = 'c';

    const result = keepUnchangedObjects(previous, next);

    expect(result.relationships).not.toBe(previous.relationships);
    expect(result.relationships[0]).toBe(previous.relationships[0]);
    expect(result.relationships[1]).toEqual({ uuid: 'rel-2', relationshipType: 'c' });
    expect(result.relationships).toHaveLength(2);
  });

  it('gives a new Date when the date changes and keeps an equal one', () => {
    const previous = keepUnchangedObjects(undefined, makeValues());
    const next = makeValues();
    next.birthdate = new Date('2000-01-01');

    const result = keepUnchangedObjects(previous, next);

    expect(result.birthdate).toEqual(new Date('2000-01-01'));
    expect(result.birthdate).not.toBe(previous.birthdate);
    expect(result.address).toBe(previous.address);
  });

  it('does not hand out the objects of the new values', () => {
    const next = makeValues();
    const result = keepUnchangedObjects(undefined, next);

    next.identifiers.ssn.identifierValue = 'changed in place';
    next.relationships.push({ uuid: 'rel-3', relationshipType: 'd' });
    next.birthdate.setFullYear(2010);

    expect(result.identifiers.ssn.identifierValue).toBe('123');
    expect(result.relationships).toHaveLength(2);
    expect(result.birthdate).toEqual(new Date('1990-01-01'));
  });
});
