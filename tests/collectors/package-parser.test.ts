import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePackages } from '../../src/collectors/package-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '../fixtures/mock-manifests');

describe('parsePackages', () => {
  it('parses package.json correctly', async () => {
    const result = await parsePackages(fixturesDir);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('my-app');
    expect(result!.version).toBe('2.1.0');
    expect(result!.dependencyCount).toBe(3);
    expect(result!.devDependencyCount).toBe(2);
    expect(result!.packageManager).toBe('npm');
  });

  it('returns null for a directory with no manifest', async () => {
    const result = await parsePackages('/tmp/nonexistent-repo-xyz');
    expect(result).toBeNull();
  });
});
