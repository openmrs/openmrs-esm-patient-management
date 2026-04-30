import { convertTime12to24 } from '../time';

describe('convertTime12to24', () => {
  describe('AM conversion', () => {
    it('should convert 12:00 AM to 00:00', () => {
      const result = convertTime12to24('12:00', 'AM');
      expect(result).toEqual(['00', '00']);
    });

    it('should convert 12:30 AM to 00:30', () => {
      const result = convertTime12to24('12:30', 'AM');
      expect(result).toEqual(['00', '30']);
    });

    it('should convert 1:00 AM to 1:00', () => {
      const result = convertTime12to24('1:00', 'AM');
      expect(result).toEqual(['1', '00']);
    });

    it('should convert 1:15 AM to 1:15', () => {
      const result = convertTime12to24('1:15', 'AM');
      expect(result).toEqual(['1', '15']);
    });

    it('should convert 11:59 AM to 11:59', () => {
      const result = convertTime12to24('11:59', 'AM');
      expect(result).toEqual(['11', '59']);
    });

    it('should convert 6:45 AM to 6:45', () => {
      const result = convertTime12to24('6:45', 'AM');
      expect(result).toEqual(['6', '45']);
    });

    it('should handle single digit hour in AM', () => {
      const result = convertTime12to24('9:00', 'AM');
      expect(result).toEqual(['9', '00']);
    });

    it('should handle single digit minute in AM', () => {
      const result = convertTime12to24('10:5', 'AM');
      expect(result).toEqual(['10', '5']);
    });
  });

  describe('PM conversion', () => {
    it('should convert 12:00 PM to 12:00', () => {
      const result = convertTime12to24('12:00', 'PM');
      expect(result).toEqual(['12', '00']);
    });

    it('should convert 12:30 PM to 12:30', () => {
      const result = convertTime12to24('12:30', 'PM');
      expect(result).toEqual(['12', '30']);
    });

    it('should convert 1:00 PM to 13:00', () => {
      const result = convertTime12to24('1:00', 'PM');
      expect(result).toEqual([13, '00']);
    });

    it('should convert 1:15 PM to 13:15', () => {
      const result = convertTime12to24('1:15', 'PM');
      expect(result).toEqual([13, '15']);
    });

    it('should convert 11:59 PM to 23:59', () => {
      const result = convertTime12to24('11:59', 'PM');
      expect(result).toEqual([23, '59']);
    });

    it('should convert 6:30 PM to 18:30', () => {
      const result = convertTime12to24('6:30', 'PM');
      expect(result).toEqual([18, '30']);
    });

    it('should convert 2:45 PM to 14:45', () => {
      const result = convertTime12to24('2:45', 'PM');
      expect(result).toEqual([14, '45']);
    });

    it('should convert 10:00 PM to 22:00', () => {
      const result = convertTime12to24('10:00', 'PM');
      expect(result).toEqual([22, '00']);
    });

    it('should handle single digit hour in PM', () => {
      const result = convertTime12to24('9:00', 'PM');
      expect(result).toEqual([21, '00']);
    });

    it('should handle single digit minute in PM', () => {
      const result = convertTime12to24('3:5', 'PM');
      expect(result).toEqual([15, '5']);
    });
  });

  describe('edge cases', () => {
    it('should handle 00:00 AM (midnight)', () => {
      const result = convertTime12to24('00:00', 'AM');
      expect(result).toEqual(['00', '00']);
    });

    it('should handle 12:59 AM (last minute before 1 AM)', () => {
      const result = convertTime12to24('12:59', 'AM');
      expect(result).toEqual(['00', '59']);
    });

    it('should handle 12:00 PM (noon)', () => {
      const result = convertTime12to24('12:00', 'PM');
      expect(result).toEqual(['12', '00']);
    });

    it('should handle 12:59 PM (last minute before midnight)', () => {
      const result = convertTime12to24('12:59', 'PM');
      expect(result).toEqual(['12', '59']);
    });

    it('should convert all valid PM hours (1-11)', () => {
      const expectedResults = [
        [13, '00'], // 1 PM
        [14, '00'], // 2 PM
        [15, '00'], // 3 PM
        [16, '00'], // 4 PM
        [17, '00'], // 5 PM
        [18, '00'], // 6 PM
        [19, '00'], // 7 PM
        [20, '00'], // 8 PM
        [21, '00'], // 9 PM
        [22, '00'], // 10 PM
        [23, '00'], // 11 PM
      ];

      for (let i = 1; i <= 11; i++) {
        const result = convertTime12to24(`${i}:00`, 'PM');
        expect(result).toEqual(expectedResults[i - 1]);
      }
    });

    it('should convert all valid AM hours (1-11)', () => {
      const expectedResults = [
        ['1', '00'], // 1 AM
        ['2', '00'], // 2 AM
        ['3', '00'], // 3 AM
        ['4', '00'], // 4 AM
        ['5', '00'], // 5 AM
        ['6', '00'], // 6 AM
        ['7', '00'], // 7 AM
        ['8', '00'], // 8 AM
        ['9', '00'], // 9 AM
        ['10', '00'], // 10 AM
        ['11', '00'], // 11 AM
      ];

      for (let i = 1; i <= 11; i++) {
        const result = convertTime12to24(`${i}:00`, 'AM');
        expect(result).toEqual(expectedResults[i - 1]);
      }
    });
  });

  describe('invalid/malformed input', () => {
    it('should handle time with no colon separator', () => {
      const result = convertTime12to24('1200', 'AM');
      expect(result).toEqual(['1200', undefined]);
    });

    it('should handle time with only hour part', () => {
      const result = convertTime12to24('10', 'AM');
      expect(result).toEqual(['10', undefined]);
    });

    it('should handle empty string', () => {
      const result = convertTime12to24('', 'AM');
      expect(result).toEqual(['', undefined]);
    });

    it('should handle multiple colons in time string', () => {
      const result = convertTime12to24('10:30:45', 'AM');
      expect(result).toEqual(['10', '30']);
    });

    it('should handle non-numeric hours', () => {
      const result = convertTime12to24('abc:00', 'AM');
      // Should attempt to parse but result in NaN when converted to integer
      expect(result[0]).toBe('abc');
      expect(result[1]).toBe('00');
    });

    it('should handle leading zeros in minutes', () => {
      const result = convertTime12to24('1:05', 'AM');
      expect(result).toEqual(['1', '05']);
    });

    it('should handle whitespace in time string', () => {
      const result = convertTime12to24('10 : 30', 'AM');
      expect(result).toEqual(['10 ', ' 30']);
    });
  });

  describe('return value structure', () => {
    it('should always return an array of exactly 2 elements', () => {
      const result = convertTime12to24('10:30', 'AM');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should return first element as hours and second as minutes', () => {
      const result = convertTime12to24('3:45', 'AM');
      expect(result[0]).toBeDefined();
      expect(result[1]).toBeDefined();
    });

    it('should preserve minute part exactly as provided', () => {
      const result = convertTime12to24('5:59', 'AM');
      expect(result[1]).toBe('59');
    });

    it('should return hour as number after PM conversion (except for 12 PM)', () => {
      const result1 = convertTime12to24('5:00', 'PM');
      expect(typeof result1[0]).toBe('number');

      const result2 = convertTime12to24('12:00', 'PM');
      // 12 PM returns the string '12', not a number
      expect(result2[0]).toBe('12');
    });

    it('should return hour as string for AM times and non-12 values', () => {
      const result = convertTime12to24('5:00', 'AM');
      expect(typeof result[0]).toBe('string');
    });
  });
});
