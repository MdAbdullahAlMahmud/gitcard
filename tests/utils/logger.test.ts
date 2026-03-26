import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../../src/utils/logger.js';

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  })),
}));

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('info() calls console.log', () => {
    logger.info('hello');
    expect(console.log).toHaveBeenCalled();
  });

  it('success() calls console.log', () => {
    logger.success('done');
    expect(console.log).toHaveBeenCalled();
  });

  it('warn() calls console.warn', () => {
    logger.warn('careful');
    expect(console.warn).toHaveBeenCalled();
  });

  it('error() calls console.error', () => {
    logger.error('oops');
    expect(console.error).toHaveBeenCalled();
  });

  it('start() returns spinner', () => {
    const spinner = logger.start('loading...');
    expect(spinner).toBeTruthy();
  });

  it('succeed() clears spinner without error', () => {
    logger.start('loading...');
    expect(() => logger.succeed('done')).not.toThrow();
  });

  it('fail() clears spinner without error', () => {
    logger.start('loading...');
    expect(() => logger.fail('failed')).not.toThrow();
  });

  it('stop() clears spinner without error', () => {
    logger.start('loading...');
    expect(() => logger.stop()).not.toThrow();
  });

  it('succeed() with no active spinner is a no-op', () => {
    expect(() => logger.succeed()).not.toThrow();
  });

  it('fail() with no active spinner is a no-op', () => {
    expect(() => logger.fail()).not.toThrow();
  });

  it('stop() with no active spinner is a no-op', () => {
    expect(() => logger.stop()).not.toThrow();
  });
});
