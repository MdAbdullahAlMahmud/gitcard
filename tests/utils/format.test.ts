import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  formatNumber,
  formatAge,
  formatRelativeDate,
} from '../../src/utils/format.js';

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });

  it('formats large values with no decimal', () => {
    expect(formatBytes(10 * 1024 * 1024)).toBe('10 MB');
  });
});

describe('formatNumber', () => {
  it('formats small numbers as-is', () => {
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with k suffix', () => {
    expect(formatNumber(1500)).toBe('1.5k');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(2_500_000)).toBe('2.5M');
  });
});

describe('formatAge', () => {
  it('returns null for null input', () => {
    expect(formatAge(null)).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(formatAge('not-a-date')).toBeNull();
  });

  it('returns "today" for today', () => {
    expect(formatAge(new Date().toISOString())).toBe('today');
  });

  it('returns "yesterday" for 1 day ago', () => {
    const d = new Date(Date.now() - 1000 * 60 * 60 * 25);
    expect(formatAge(d.toISOString())).toBe('yesterday');
  });

  it('returns days ago for < 30 days', () => {
    const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
    expect(formatAge(d.toISOString())).toBe('10 days ago');
  });

  it('returns months ago for < 365 days', () => {
    const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 60);
    expect(formatAge(d.toISOString())).toBe('2 months ago');
  });

  it('returns "1 month ago" (singular)', () => {
    const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 35);
    expect(formatAge(d.toISOString())).toBe('1 month ago');
  });

  it('returns years ago for >= 365 days', () => {
    const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 400);
    expect(formatAge(d.toISOString())).toBe('1 year ago');
  });

  it('returns "2 years ago" (plural)', () => {
    const d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 800);
    expect(formatAge(d.toISOString())).toBe('2 years ago');
  });
});

describe('formatRelativeDate', () => {
  it('falls back to original string for invalid date', () => {
    expect(formatRelativeDate('not-a-date')).toBe('not-a-date');
  });

  it('formats a valid date', () => {
    const result = formatRelativeDate(new Date().toISOString());
    expect(result).toBe('today');
  });
});
