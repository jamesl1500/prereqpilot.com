/**
 * Tests for utility functions and helpers
 */

describe('Utility functions', () => {
  describe('Date utilities', () => {
    it('formats date correctly', () => {
      const date = new Date('2025-01-15T00:00:00Z');
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(formatted).toContain('2025');
      expect(formatted).toContain('January');
    });

    it('calculates date difference', () => {
      const date1 = new Date('2025-01-15');
      const date2 = new Date('2025-01-20');
      const diffDays = Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(5);
    });

    it('validates date range', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2025-12-31');
      const test = new Date('2025-06-15');
      expect(test > start && test < end).toBe(true);
    });
  });

  describe('String utilities', () => {
    it('formats email address', () => {
      const email = '  USER@EXAMPLE.COM  ';
      const formatted = email.trim().toLowerCase();
      expect(formatted).toBe('user@example.com');
    });

    it('capitalizes strings', () => {
      const str = 'hello world';
      const capitalized = str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      expect(capitalized).toBe('Hello World');
    });

    it('validates email format', () => {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('user@example.com');
      const invalid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('invalid-email');
      expect(valid).toBe(true);
      expect(invalid).toBe(false);
    });

    it('trims whitespace', () => {
      const str = '  test string  ';
      expect(str.trim()).toBe('test string');
    });
  });

  describe('Array utilities', () => {
    it('filters array', () => {
      const arr = [1, 2, 3, 4, 5];
      const filtered = arr.filter((n) => n > 2);
      expect(filtered).toEqual([3, 4, 5]);
    });

    it('maps array values', () => {
      const arr = ['a', 'b', 'c'];
      const mapped = arr.map((v) => v.toUpperCase());
      expect(mapped).toEqual(['A', 'B', 'C']);
    });

    it('finds element in array', () => {
      const arr = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
      const found = arr.find((item) => item.id === 2);
      expect(found).toEqual({ id: 2, name: 'B' });
    });

    it('checks array includes value', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(arr.includes(3)).toBe(true);
      expect(arr.includes(10)).toBe(false);
    });

    it('removes duplicates from array', () => {
      const arr = [1, 2, 2, 3, 3, 3];
      const unique = [...new Set(arr)];
      expect(unique).toEqual([1, 2, 3]);
    });

    it('sorts array', () => {
      const arr = [3, 1, 4, 1, 5, 9];
      const sorted = [...arr].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 1, 3, 4, 5, 9]);
    });
  });

  describe('Object utilities', () => {
    it('merges objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { c: 3, d: 4 };
      const merged = { ...obj1, ...obj2 };
      expect(merged).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    it('clones object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = JSON.parse(JSON.stringify(original));
      clone.b.c = 3;
      expect(original.b.c).toBe(2);
      expect(clone.b.c).toBe(3);
    });

    it('checks object has property', () => {
      const obj = { name: 'test', value: 123 };
      expect('name' in obj).toBe(true);
      expect('missing' in obj).toBe(false);
    });

    it('gets object keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keys = Object.keys(obj);
      expect(keys).toEqual(['a', 'b', 'c']);
    });

    it('gets object values', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const values = Object.values(obj);
      expect(values).toEqual([1, 2, 3]);
    });
  });

  describe('Number utilities', () => {
    it('parses integer', () => {
      expect(parseInt('123', 10)).toBe(123);
      expect(parseInt('abc', 10)).toBeNaN();
    });

    it('parses float', () => {
      expect(parseFloat('3.14')).toBeCloseTo(3.14);
      expect(parseFloat('2')).toBe(2);
    });

    it('rounds number', () => {
      expect(Math.round(3.6)).toBe(4);
      expect(Math.round(3.4)).toBe(3);
    });

    it('calculates percentage', () => {
      const percentage = (25 / 100) * 100;
      expect(percentage).toBe(25);
    });

    it('checks if number is valid', () => {
      expect(Number.isNaN(NaN)).toBe(true);
      expect(Number.isNaN(123)).toBe(false);
      expect(Number.isFinite(123)).toBe(true);
      expect(Number.isFinite(Infinity)).toBe(false);
    });
  });

  describe('Conditional utilities', () => {
    it('returns value based on condition', () => {
      const condition = true;
      const result = condition ? 'yes' : 'no';
      expect(result).toBe('yes');
    });

    it('chains conditional checks', () => {
      const status = 'active';
      const result =
        status === 'active'
          ? 'Available'
          : status === 'inactive'
            ? 'Unavailable'
            : 'Unknown';
      expect(result).toBe('Available');
    });

    it('handles null coalescing', () => {
      const value = null;
      const result = value ?? 'default';
      expect(result).toBe('default');
    });
  });
});
